
from pydantic import BaseModel


class FindingResponse(BaseModel):
    id: str
    review_id: str
    title: str
    description: str | None = None
    severity: str
    category: str
    file_path: str | None = None
    line_start: int | None = None
    line_end: int | None = None
    evidence: str | None = None
    recommendation: str | None = None
    confidence: str | None = None
    status: str

    model_config = {"from_attributes": True}


class ReviewResponse(BaseModel):
    id: str
    project_id: str
    title: str
    summary: str | None = None
    review_type: str | None = None
    created_at: str | None = None

    model_config = {"from_attributes": True}
