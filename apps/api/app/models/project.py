from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Project(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "projects"

    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="ACTIVE", nullable=False)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)

    workspace = relationship("Workspace", back_populates="projects")
    requirements = relationship("Requirement", back_populates="project", cascade="all, delete-orphan")
    architectures = relationship("Architecture", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    workflows = relationship("Workflow", back_populates="project", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="project", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="project", cascade="all, delete-orphan")
    agent_runs = relationship("AgentRun", back_populates="project", cascade="all, delete-orphan")
