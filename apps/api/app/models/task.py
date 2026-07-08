import enum

from sqlalchemy import JSON, Column, ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class TaskStatus(enum.StrEnum):
    BACKLOG = "BACKLOG"
    READY = "READY"
    IN_PROGRESS = "IN_PROGRESS"
    BLOCKED = "BLOCKED"
    IN_REVIEW = "IN_REVIEW"
    DONE = "DONE"
    CANCELLED = "CANCELLED"


class TaskPriority(enum.StrEnum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Task(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "tasks"

    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    acceptance_criteria = Column(Text, nullable=True)
    priority = Column(SAEnum(TaskPriority), default=TaskPriority.MEDIUM, nullable=False)
    status = Column(SAEnum(TaskStatus), default=TaskStatus.BACKLOG, nullable=False)
    assignee_agent = Column(String(100), nullable=True)
    estimate = Column(Integer, nullable=True)
    labels = Column(JSON, nullable=True)
    epic = Column(String(500), nullable=True)
    story = Column(String(500), nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)

    project = relationship("Project", back_populates="tasks")
    dependencies = relationship("TaskDependency", foreign_keys="TaskDependency.task_id", back_populates="task", cascade="all, delete-orphan")


class TaskDependency(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "task_dependencies"

    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    depends_on_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)

    task = relationship("Task", foreign_keys=[task_id], back_populates="dependencies")
