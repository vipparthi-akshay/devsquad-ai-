import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember, WorkspaceRole
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, req: RegisterRequest) -> TokenResponse:
        existing = await self.db.execute(select(User).where(User.email == req.email))
        if existing.scalar_one_or_none():
            raise ValueError("Email already registered")

        user = User(
            email=req.email,
            password_hash=hash_password(req.password),
            full_name=req.full_name,
        )
        self.db.add(user)
        await self.db.flush()

        personal_workspace = Workspace(
            name=f"{req.full_name}'s Workspace",
            slug=f"ws-{uuid.uuid4().hex[:8]}",
            description="Personal workspace",
        )
        self.db.add(personal_workspace)
        await self.db.flush()

        member = WorkspaceMember(
            user_id=user.id,
            workspace_id=personal_workspace.id,
            role=WorkspaceRole.OWNER,
        )
        self.db.add(member)
        await self.db.flush()

        token = create_access_token({"sub": str(user.id)})
        return TokenResponse(access_token=token)

    async def login(self, req: LoginRequest) -> TokenResponse:
        result = await self.db.execute(select(User).where(User.email == req.email))
        user = result.scalar_one_or_none()
        if not user or not verify_password(req.password, user.password_hash):
            raise ValueError("Invalid email or password")

        token = create_access_token({"sub": str(user.id)})
        return TokenResponse(access_token=token)

    async def get_user(self, user_id: str) -> UserResponse | None:
        result = await self.db.execute(select(User).where(User.id == uuid.UUID(user_id)))
        user = result.scalar_one_or_none()
        if user:
            return UserResponse(
                id=str(user.id),
                email=user.email,
                full_name=user.full_name,
                is_active=user.is_active,
            )
        return None

    async def register_or_login_google(self, email: str, name: str) -> str:
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user:
            return create_access_token({"sub": str(user.id)})

        user = User(
            email=email,
            password_hash="",  # no password for Google users
            full_name=name,
        )
        self.db.add(user)
        await self.db.flush()

        personal_workspace = Workspace(
            name=f"{name}'s Workspace",
            slug=f"ws-{uuid.uuid4().hex[:8]}",
            description="Personal workspace",
        )
        self.db.add(personal_workspace)
        await self.db.flush()

        member = WorkspaceMember(
            user_id=user.id,
            workspace_id=personal_workspace.id,
            role=WorkspaceRole.OWNER,
        )
        self.db.add(member)
        await self.db.flush()

        return create_access_token({"sub": str(user.id)})
