import enum

from sqlalchemy import JSON, Column, Float, ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class AgentType(enum.StrEnum):
    PRODUCT_MANAGER = "PRODUCT_MANAGER"
    REQUIREMENTS_ANALYST = "REQUIREMENTS_ANALYST"
    SYSTEM_ARCHITECT = "SYSTEM_ARCHITECT"
    FRONTEND_ENGINEER = "FRONTEND_ENGINEER"
    BACKEND_ENGINEER = "BACKEND_ENGINEER"
    DATABASE_ENGINEER = "DATABASE_ENGINEER"
    AI_ENGINEER = "AI_ENGINEER"
    SECURITY_ENGINEER = "SECURITY_ENGINEER"
    QA_ENGINEER = "QA_ENGINEER"
    CODE_REVIEWER = "CODE_REVIEWER"
    DEVOPS_ENGINEER = "DEVOPS_ENGINEER"


class AgentStatus(enum.StrEnum):
    IDLE = "IDLE"
    PLANNING = "PLANNING"
    RUNNING = "RUNNING"
    WAITING = "WAITING"
    REVIEWING = "REVIEWING"
    FAILED = "FAILED"
    COMPLETED = "COMPLETED"


class AgentDefinition(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "agent_definitions"

    name = Column(String(255), nullable=False)
    agent_type = Column(SAEnum(AgentType), nullable=False)
    description = Column(Text, nullable=True)
    role_description = Column(Text, nullable=True)
    capabilities = Column(JSON, nullable=True)
    is_active = Column(SAEnum(AgentStatus), default=AgentStatus.IDLE, nullable=False)

    runs = relationship("AgentRun", back_populates="agent_definition", cascade="all, delete-orphan")


class AgentRun(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "agent_runs"

    agent_id = Column(UUID(as_uuid=True), ForeignKey("agent_definitions.id", ondelete="CASCADE"), nullable=False)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id", ondelete="SET NULL"), nullable=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="PENDING", nullable=False)
    model_provider = Column(String(100), nullable=True)
    model_identifier = Column(String(100), nullable=True)
    prompt_version = Column(String(50), nullable=True)
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    start_time = Column(String(50), nullable=True)
    end_time = Column(String(50), nullable=True)
    duration_seconds = Column(Float, nullable=True)
    token_usage_prompt = Column(Integer, nullable=True)
    token_usage_completion = Column(Integer, nullable=True)
    estimated_cost = Column(Float, nullable=True)
    error = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)

    agent_definition = relationship("AgentDefinition", back_populates="runs")
    workflow = relationship("Workflow", back_populates="agent_runs")
    project = relationship("Project", back_populates="agent_runs")
    tool_calls = relationship("ToolCall", back_populates="agent_run", cascade="all, delete-orphan")
    artifacts = relationship("Artifact", back_populates="agent_run", cascade="all, delete-orphan")
