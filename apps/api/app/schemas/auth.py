from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    is_active: bool

    model_config = {"from_attributes": True}


class WorkspaceResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None = None
    role: str | None = None

    model_config = {"from_attributes": True}
