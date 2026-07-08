import uuid
from datetime import datetime, timezone

import stripe
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.payment import (
    CreateCheckoutSessionRequest,
    CreateCheckoutSessionResponse,
    PlanResponse,
    SubscriptionResponse,
)

PLANS = [
    PlanResponse(
        id="starter",
        name="Starter",
        description="For individuals and small projects",
        price=0,
        currency="usd",
        interval="month",
        features=[
            "Up to 3 projects",
            "Basic AI agents",
            "Community support",
            "1 GB storage",
        ],
    ),
    PlanResponse(
        id="pro",
        name="Pro",
        description="For growing teams and professionals",
        price=2900,
        currency="usd",
        interval="month",
        features=[
            "Unlimited projects",
            "Advanced AI agents",
            "Priority support",
            "50 GB storage",
            "Custom workflows",
            "API access",
        ],
    ),
    PlanResponse(
        id="enterprise",
        name="Enterprise",
        description="For large organizations",
        price=9900,
        currency="usd",
        interval="month",
        features=[
            "Everything in Pro",
            "Dedicated AI agents",
            "24/7 phone support",
            "Unlimited storage",
            "SSO / SAML",
            "Custom integrations",
            "SLA guarantee",
        ],
    ),
]

PLAN_TO_PRICE_ID = {
    "pro": settings.stripe_pro_price_id,
    "enterprise": settings.stripe_enterprise_price_id,
}


class PaymentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        stripe.api_key = settings.stripe_secret_key

    async def get_plans(self) -> list[PlanResponse]:
        return PLANS

    async def create_checkout_session(
        self, user: User, req: CreateCheckoutSessionRequest
    ) -> CreateCheckoutSessionResponse:
        price_id = PLAN_TO_PRICE_ID.get(req.price_id) or req.price_id
        if not price_id:
            raise ValueError(f"Unknown plan: {req.price_id}")

        customer_id = await self._get_or_create_customer(user)

        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=req.success_url,
            cancel_url=req.cancel_url,
            metadata={"user_id": str(user.id), "plan_id": req.price_id},
        )

        return CreateCheckoutSessionResponse(
            session_id=session.id,
            url=session.url,
        )

    async def create_portal_session(self, user: User) -> str:
        result = await self.db.execute(
            select(Subscription).where(
                Subscription.user_id == user.id,
                Subscription.status.in_(["active", "past_due"]),
            )
        )
        sub = result.scalar_one_or_none()
        if not sub:
            raise ValueError("No active subscription found")

        session = stripe.billing_portal.Session.create(
            customer=sub.stripe_customer_id,
            return_url=f"{settings.cors_origin_list[0]}/billing",
        )
        return session.url

    async def get_subscription(self, user: User) -> SubscriptionResponse | None:
        result = await self.db.execute(
            select(Subscription).where(Subscription.user_id == user.id)
        )
        sub = result.scalar_one_or_none()
        if not sub:
            return None
        return SubscriptionResponse(
            id=str(sub.id),
            plan_id=sub.plan_id,
            status=sub.status,
            current_period_start=sub.current_period_start,
            current_period_end=sub.current_period_end,
            cancel_at_period_end=sub.cancel_at_period_end,
        )

    async def handle_webhook(self, payload: bytes, sig_header: str) -> None:
        endpoint_secret = settings.stripe_webhook_secret
        if not endpoint_secret:
            raise ValueError("Webhook secret not configured")

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except ValueError:
            raise ValueError("Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise ValueError("Invalid signature")

        handler = {
            "checkout.session.completed": self._handle_checkout_completed,
            "customer.subscription.updated": self._handle_subscription_updated,
            "customer.subscription.deleted": self._handle_subscription_deleted,
            "invoice.payment_succeeded": self._handle_invoice_paid,
            "invoice.payment_failed": self._handle_invoice_failed,
        }.get(event["type"])

        if handler:
            await handler(event["data"]["object"])

    async def _get_or_create_customer(self, user: User) -> str:
        result = await self.db.execute(
            select(Subscription).where(Subscription.user_id == user.id)
        )
        sub = result.scalar_one_or_none()
        if sub and sub.stripe_customer_id:
            return sub.stripe_customer_id

        customer = stripe.Customer.create(
            email=user.email,
            name=user.full_name,
            metadata={"user_id": str(user.id)},
        )
        return customer.id

    async def _upsert_subscription(self, user_id: uuid.UUID, customer_id: str, sub_data: dict) -> None:
        result = await self.db.execute(
            select(Subscription).where(
                Subscription.stripe_subscription_id == sub_data["id"]
            )
        )
        sub = result.scalar_one_or_none()

        period_start = datetime.fromtimestamp(sub_data["current_period_start"], tz=timezone.utc) if sub_data.get("current_period_start") else None
        period_end = datetime.fromtimestamp(sub_data["current_period_end"], tz=timezone.utc) if sub_data.get("current_period_end") else None

        if sub:
            sub.status = sub_data["status"]
            sub.plan_id = sub_data.get("plan_id", sub.plan_id)
            sub.current_period_start = period_start
            sub.current_period_end = period_end
            sub.cancel_at_period_end = sub_data.get("cancel_at_period_end", False)
        else:
            sub = Subscription(
                user_id=user_id,
                stripe_customer_id=customer_id,
                stripe_subscription_id=sub_data["id"],
                plan_id=sub_data.get("plan_id", ""),
                status=sub_data["status"],
                current_period_start=period_start,
                current_period_end=period_end,
                cancel_at_period_end=sub_data.get("cancel_at_period_end", False),
            )
            self.db.add(sub)
        await self.db.flush()

    async def _handle_checkout_completed(self, session: dict) -> None:
        customer_id = session["customer"]
        metadata = session.get("metadata", {})
        user_id = metadata.get("user_id") or session["client_reference_id"]
        plan_id = metadata.get("plan_id", "pro")
        subscription_id = session.get("subscription")

        if subscription_id:
            sub = stripe.Subscription.retrieve(subscription_id)
            await self._upsert_subscription(
                uuid.UUID(user_id),
                customer_id,
                {
                    "id": sub.id,
                    "status": sub.status,
                    "plan_id": plan_id,
                    "current_period_start": sub.current_period_start,
                    "current_period_end": sub.current_period_end,
                    "cancel_at_period_end": sub.cancel_at_period_end,
                },
            )

    async def _handle_subscription_updated(self, sub: dict) -> None:
        customer_id = sub["customer"]
        result = await self.db.execute(
            select(Subscription).where(
                Subscription.stripe_subscription_id == sub["id"]
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            plan_id = sub.get("metadata", {}).get("plan_id") or existing.plan_id
            existing.status = sub["status"]
            existing.current_period_start = datetime.fromtimestamp(sub["current_period_start"], tz=timezone.utc)
            existing.current_period_end = datetime.fromtimestamp(sub["current_period_end"], tz=timezone.utc)
            existing.cancel_at_period_end = sub.get("cancel_at_period_end", False)
            existing.plan_id = plan_id
            await self.db.flush()

    async def _handle_subscription_deleted(self, sub: dict) -> None:
        result = await self.db.execute(
            select(Subscription).where(
                Subscription.stripe_subscription_id == sub["id"]
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            existing.status = "canceled"
            await self.db.flush()

    async def _handle_invoice_paid(self, invoice: dict) -> None:
        pass

    async def _handle_invoice_failed(self, invoice: dict) -> None:
        subscription_id = invoice.get("subscription")
        if subscription_id:
            result = await self.db.execute(
                select(Subscription).where(
                    Subscription.stripe_subscription_id == subscription_id
                )
            )
            existing = result.scalar_one_or_none()
            if existing:
                existing.status = "past_due"
                await self.db.flush()
