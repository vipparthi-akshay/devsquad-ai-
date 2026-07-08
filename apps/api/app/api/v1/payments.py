from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.payment import (
    CreateCheckoutSessionRequest,
    CreateCheckoutSessionResponse,
    PlanResponse,
    SubscriptionResponse,
)
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])


@router.get("/plans", response_model=list[PlanResponse])
async def get_plans(db: AsyncSession = Depends(get_db)):
    service = PaymentService(db)
    return await service.get_plans()


@router.post("/create-checkout-session", response_model=CreateCheckoutSessionResponse)
async def create_checkout_session(
    req: CreateCheckoutSessionRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = PaymentService(db)
    try:
        return await service.create_checkout_session(user, req)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/create-portal-session")
async def create_portal_session(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = PaymentService(db)
    try:
        url = await service.create_portal_session(user)
        return {"url": url}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/subscription", response_model=SubscriptionResponse | None)
async def get_subscription(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = PaymentService(db)
    return await service.get_subscription(user)


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    service = PaymentService(db)
    try:
        await service.handle_webhook(payload, sig_header)
        return {"received": True}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
