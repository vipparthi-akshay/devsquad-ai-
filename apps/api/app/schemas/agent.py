from typing import Any

from pydantic import BaseModel


class AgentDefinitionResponse(BaseModel):
    id: str
    name: str
    agent_type: str
    description: str | None = None
    role_description: str | None = None
    capabilities: Any | None = None
    is_active: str

    model_config = {"from_attributes": True}


class AgentRunResponse(BaseModel):
    id: str
    agent_id: str
    workflow_id: str | None = None
    project_id: str
    status: str
    model_provider: str | None = None
    model_identifier: str | None = None
    prompt_version: str | None = None
    start_time: str | None = None
    end_time: str | None = None
    duration_seconds: float | None = None
    token_usage_prompt: int | None = None
    token_usage_completion: int | None = None
    estimated_cost: float | None = None
    error: str | None = None
    input_data: Any | None = None
    output_data: Any | None = None
    created_at: str | None = None

    model_config = {"from_attributes": True}
