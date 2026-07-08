
from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    workspace_id: str


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: str | None = None
    status: str
    workspace_id: str
    created_at: str | None = None
    updated_at: str | None = None

    model_config = {"from_attributes": True}
