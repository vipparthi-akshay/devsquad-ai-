import enum

from sqlalchemy import JSON, Column, ForeignKey, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class ApprovalStatus(enum.StrEnum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"


class Approval(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "approvals"

    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id", ondelete="SET NULL"), nullable=True)
    agent_run_id = Column(UUID(as_uuid=True), ForeignKey("agent_runs.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SAEnum(ApprovalStatus), default=ApprovalStatus.PENDING, nullable=False)
    requesting_agent = Column(String(100), nullable=True)
    proposed_action = Column(String(500), nullable=True)
    reason = Column(Text, nullable=True)
    affected_files = Column(JSON, nullable=True)
    command_preview = Column(String(1000), nullable=True)
    risk_level = Column(String(50), default="LOW", nullable=False)
    expected_impact = Column(Text, nullable=True)
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = Column(String(50), nullable=True)
    rejection_reason = Column(Text, nullable=True)

    project = relationship("Project", back_populates="approvals")
    workflow = relationship("Workflow", back_populates="approvals")
