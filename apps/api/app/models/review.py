import enum

from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Severity(enum.StrEnum):
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class FindingCategory(enum.StrEnum):
    CORRECTNESS = "CORRECTNESS"
    SECURITY = "SECURITY"
    PERFORMANCE = "PERFORMANCE"
    MAINTAINABILITY = "MAINTAINABILITY"
    ACCESSIBILITY = "ACCESSIBILITY"
    TESTING = "TESTING"
    ARCHITECTURE = "ARCHITECTURE"


class FindingStatus(enum.StrEnum):
    OPEN = "OPEN"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    FIXED = "FIXED"
    WONT_FIX = "WONT_FIX"


class Review(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "reviews"

    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    agent_run_id = Column(UUID(as_uuid=True), ForeignKey("agent_runs.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(500), nullable=False)
    summary = Column(Text, nullable=True)
    review_type = Column(String(100), nullable=True)


class Finding(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "findings"

    review_id = Column(UUID(as_uuid=True), ForeignKey("reviews.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(SAEnum(Severity), default=Severity.INFO, nullable=False)
    category = Column(SAEnum(FindingCategory), default=FindingCategory.CORRECTNESS, nullable=False)
    file_path = Column(String(1000), nullable=True)
    line_start = Column(Integer, nullable=True)
    line_end = Column(Integer, nullable=True)
    evidence = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    confidence = Column(String(50), nullable=True)
    status = Column(SAEnum(FindingStatus), default=FindingStatus.OPEN, nullable=False)
