from sqlalchemy import Column, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Evaluation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "evaluations"

    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    evaluator_type = Column(String(100), nullable=False)
    score = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)


class EvaluationCase(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "evaluation_cases"

    evaluation_id = Column(UUID(as_uuid=True), ForeignKey("evaluations.id", ondelete="CASCADE"), nullable=False)
    input_text = Column(Text, nullable=False)
    expected_constraints = Column(Text, nullable=True)
    output_text = Column(Text, nullable=True)
    score = Column(Float, nullable=True)
    evaluator_notes = Column(Text, nullable=True)
