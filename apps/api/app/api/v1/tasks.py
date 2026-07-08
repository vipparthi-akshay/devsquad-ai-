from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskResponse

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])


@router.get("/project/{project_id}", response_model=list[TaskResponse])
async def list_tasks(
    project_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Task).where(Task.project_id == project_id).order_by(Task.sort_order)
    )
    tasks = result.scalars().all()
    return [
        TaskResponse(
            id=str(t.id),
            project_id=str(t.project_id),
            title=t.title,
            description=t.description,
            acceptance_criteria=t.acceptance_criteria,
            priority=t.priority.value if hasattr(t.priority, 'value') else str(t.priority),
            status=t.status.value if hasattr(t.status, 'value') else str(t.status),
            assignee_agent=t.assignee_agent,
            estimate=t.estimate,
            labels=t.labels,
            epic=t.epic,
            story=t.story,
            sort_order=t.sort_order,
            created_at=t.created_at.isoformat() if t.created_at else None,
        )
        for t in tasks
    ]
