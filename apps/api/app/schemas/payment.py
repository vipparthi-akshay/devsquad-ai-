from datetime import datetime
from pydantic import BaseModel


class PlanResponse(BaseModel):
    id: str
    name: str
    description: str
    price: int
    currency: str
    interval: str
    features: list[str]


class CreateCheckoutSessionRequest(BaseModel):
    price_id: str
    success_url: str
    cancel_url: str


class CreateCheckoutSessionResponse(BaseModel):
    session_id: str
    url: str


class SubscriptionResponse(BaseModel):
    id: str
    plan_id: str
    status: str
    current_period_start: datetime | None
    current_period_end: datetime | None
    cancel_at_period_end: bool
