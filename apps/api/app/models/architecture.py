from sqlalchemy import JSON, Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Architecture(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "architectures"

    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    summary = Column(Text, nullable=True)
    component_model = Column(JSON, nullable=True)
    deployment_model = Column(JSON, nullable=True)
    api_boundaries = Column(JSON, nullable=True)
    data_flow = Column(JSON, nullable=True)
    risks = Column(JSON, nullable=True)
    alternatives = Column(JSON, nullable=True)
    decisions = Column(JSON, nullable=True)
    mermaid_diagram = Column(Text, nullable=True)
    status = Column(String(50), default="DRAFT", nullable=False)

    project = relationship("Project", back_populates="architectures")
