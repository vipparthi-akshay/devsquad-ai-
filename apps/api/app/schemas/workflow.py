
from pydantic import BaseModel


class WorkflowCreate(BaseModel):
    project_id: str
    name: str
    description: str | None = None
    workflow_type: str | None = None


class WorkflowResponse(BaseModel):
    id: str
    project_id: str
    name: str
    description: str | None = None
    status: str
    workflow_type: str | None = None
    current_stage: str | None = None
    created_at: str | None = None
    updated_at: str | None = None

    model_config = {"from_attributes": True}
