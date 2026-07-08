from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.event import EventResponse
from app.services.event_service import EventService

router = APIRouter(prefix="/api/v1/events", tags=["events"])


@router.get("/project/{project_id}", response_model=list[EventResponse])
async def list_events(
    project_id: str,
    limit: int = Query(default=50, le=200),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = EventService(db)
    return await service.list_by_project(project_id, limit=limit)
