from typing import Any

from pydantic import BaseModel


class ApprovalResponse(BaseModel):
    id: str
    project_id: str
    workflow_id: str | None = None
    agent_run_id: str | None = None
    title: str
    description: str | None = None
    status: str
    requesting_agent: str | None = None
    proposed_action: str | None = None
    reason: str | None = None
    affected_files: Any | None = None
    command_preview: str | None = None
    risk_level: str
    expected_impact: str | None = None
    rejection_reason: str | None = None
    created_at: str | None = None

    model_config = {"from_attributes": True}


class ApprovalAction(BaseModel):
    action: str
    rejection_reason: str | None = None
