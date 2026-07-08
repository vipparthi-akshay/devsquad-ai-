from typing import Any

from pydantic import BaseModel


class ArchitectureCreate(BaseModel):
    project_id: str


class ArchitectureResponse(BaseModel):
    id: str
    project_id: str
    summary: str | None = None
    component_model: Any | None = None
    deployment_model: Any | None = None
    api_boundaries: Any | None = None
    data_flow: Any | None = None
    risks: Any | None = None
    alternatives: Any | None = None
    decisions: Any | None = None
    mermaid_diagram: str | None = None
    status: str
    created_at: str | None = None

    model_config = {"from_attributes": True}
