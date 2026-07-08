from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.workspace import WorkspaceMember
from app.schemas.auth import WorkspaceResponse

router = APIRouter(prefix="/api/v1/workspaces", tags=["workspaces"])


@router.get("", response_model=list[WorkspaceResponse])
async def list_workspaces(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WorkspaceMember)
        .where(WorkspaceMember.user_id == user.id)
        .options(selectinload(WorkspaceMember.workspace))
    )
    members = result.scalars().all()
    return [
        WorkspaceResponse(
            id=str(m.workspace.id),
            name=m.workspace.name,
            slug=m.workspace.slug,
            description=m.workspace.description,
            role=m.role.value if hasattr(m.role, 'value') else m.role,
        )
        for m in members
    ]
