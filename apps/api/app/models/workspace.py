import enum

from sqlalchemy import Column, Enum, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class WorkspaceRole(enum.StrEnum):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    DEVELOPER = "DEVELOPER"
    REVIEWER = "REVIEWER"
    VIEWER = "VIEWER"


class Workspace(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "workspaces"

    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(String(1000), nullable=True)

    members = relationship("WorkspaceMember", back_populates="workspace", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="workspace", cascade="all, delete-orphan")


class WorkspaceMember(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "workspace_members"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    role = Column(Enum(WorkspaceRole), default=WorkspaceRole.DEVELOPER, nullable=False)

    user = relationship("User")
    workspace = relationship("Workspace", back_populates="members")

    __table_args__ = (
        UniqueConstraint("user_id", "workspace_id", name="uq_user_workspace"),
    )
