from sqlalchemy import Boolean, Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class PromptTemplate(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "prompt_templates"

    name = Column(String(255), nullable=False)
    version = Column(String(20), default="1.0", nullable=False)
    role = Column(String(100), nullable=False)
    template = Column(Text, nullable=False)
    schema_definition = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)


class PromptVersion(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "prompt_versions"

    template_id = Column(UUID(as_uuid=True), ForeignKey("prompt_templates.id", ondelete="CASCADE"), nullable=False)
    version = Column(String(20), nullable=False)
    template = Column(Text, nullable=False)
    change_log = Column(Text, nullable=True)
