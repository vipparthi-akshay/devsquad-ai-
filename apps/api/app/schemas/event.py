from typing import Any

from pydantic import BaseModel


class EventResponse(BaseModel):
    id: str
    project_id: str
    workspace_id: str | None = None
    event_type: str
    title: str
    description: str | None = None
    agent_type: str | None = None
    metadata_json: Any | None = None
    created_at: str | None = None

    model_config = {"from_attributes": True}
