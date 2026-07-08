from sqlalchemy import JSON, Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Requirement(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "requirements"

    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    input_text = Column(Text, nullable=False)
    problem_statement = Column(Text, nullable=True)
    personas = Column(JSON, nullable=True)
    user_journeys = Column(JSON, nullable=True)
    functional_requirements = Column(JSON, nullable=True)
    non_functional_requirements = Column(JSON, nullable=True)
    assumptions = Column(JSON, nullable=True)
    constraints = Column(JSON, nullable=True)
    risks = Column(JSON, nullable=True)
    acceptance_criteria = Column(JSON, nullable=True)
    mvp_scope = Column(JSON, nullable=True)
    future_scope = Column(JSON, nullable=True)
    status = Column(String(50), default="DRAFT", nullable=False)
    version = Column(String(20), default="1.0", nullable=False)

    project = relationship("Project", back_populates="requirements")
