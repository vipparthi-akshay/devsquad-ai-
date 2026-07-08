from sqlalchemy import JSON, Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Event(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "events"

    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=True)
    event_type = Column(String(100), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    agent_type = Column(String(100), nullable=True)
    metadata_json = Column(JSON, nullable=True)

    project = relationship("Project", back_populates="events")
