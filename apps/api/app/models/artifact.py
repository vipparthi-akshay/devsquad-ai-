from sqlalchemy import JSON, Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Artifact(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "artifacts"

    agent_run_id = Column(UUID(as_uuid=True), ForeignKey("agent_runs.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    artifact_type = Column(String(100), nullable=False)
    content = Column(Text, nullable=True)
    content_json = Column(JSON, nullable=True)
    file_paths = Column(JSON, nullable=True)

    agent_run = relationship("AgentRun", back_populates="artifacts")


class ToolCall(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "tool_calls"

    agent_run_id = Column(UUID(as_uuid=True), ForeignKey("agent_runs.id", ondelete="CASCADE"), nullable=False)
    tool_name = Column(String(255), nullable=False)
    input_args = Column(JSON, nullable=True)
    output = Column(JSON, nullable=True)
    status = Column(String(50), default="COMPLETED", nullable=False)
    duration_ms = Column(JSON, nullable=True)

    agent_run = relationship("AgentRun", back_populates="tool_calls")
