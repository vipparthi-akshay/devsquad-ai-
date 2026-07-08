from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


class GoogleAuthRequest(BaseModel):
    id_token: str


@router.post("/google", response_model=TokenResponse)
async def google_auth(req: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    if not settings.google_client_id:
        raise HTTPException(status_code=400, detail="Google sign-in is not configured")
    try:
        from google.auth.transport import requests as google_requests
        from google.oauth2 import id_token

        info = id_token.verify_oauth2_token(
            req.id_token,
            google_requests.Request(),
            settings.google_client_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {e}")

    email = info.get("email")
    name = info.get("name", email or "Google User")
    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    service = AuthService(db)
    token = await service.register_or_login_google(email, name)
    return TokenResponse(access_token=token)


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    try:
        return await service.register(req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    try:
        return await service.login(req)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me", response_model=UserResponse)
async def get_me(user=Depends(get_current_user)):
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
    )
