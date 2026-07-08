from typing import Any

from pydantic import BaseModel


class TaskResponse(BaseModel):
    id: str
    project_id: str
    title: str
    description: str | None = None
    acceptance_criteria: str | None = None
    priority: str
    status: str
    assignee_agent: str | None = None
    estimate: int | None = None
    labels: Any | None = None
    epic: str | None = None
    story: str | None = None
    sort_order: int
    created_at: str | None = None

    model_config = {"from_attributes": True}


class TaskDependencyResponse(BaseModel):
    id: str
    task_id: str
    depends_on_id: str

    model_config = {"from_attributes": True}
