import enum

from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class WorkflowStatus(enum.StrEnum):
    DRAFT = "DRAFT"
    PLANNING = "PLANNING"
    WAITING_FOR_APPROVAL = "WAITING_FOR_APPROVAL"
    RUNNING = "RUNNING"
    PAUSED = "PAUSED"
    REVIEWING = "REVIEWING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class Workflow(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "workflows"

    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SAEnum(WorkflowStatus), default=WorkflowStatus.DRAFT, nullable=False)
    workflow_type = Column(String(100), nullable=True)
    current_stage = Column(String(100), nullable=True)

    project = relationship("Project", back_populates="workflows")
    agent_runs = relationship("AgentRun", back_populates="workflow", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="workflow", cascade="all, delete-orphan")
