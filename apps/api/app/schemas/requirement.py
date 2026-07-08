from typing import Any

from pydantic import BaseModel


class RequirementCreate(BaseModel):
    project_id: str
    input_text: str


class RequirementResponse(BaseModel):
    id: str
    project_id: str
    input_text: str
    problem_statement: str | None = None
    personas: Any | None = None
    user_journeys: Any | None = None
    functional_requirements: Any | None = None
    non_functional_requirements: Any | None = None
    assumptions: Any | None = None
    constraints: Any | None = None
    risks: Any | None = None
    acceptance_criteria: Any | None = None
    mvp_scope: Any | None = None
    future_scope: Any | None = None
    status: str
    version: str
    created_at: str | None = None

    model_config = {"from_attributes": True}
