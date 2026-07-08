import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event
from app.schemas.event import EventResponse


class EventService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_project(self, project_id: str, limit: int = 50) -> list[EventResponse]:
        result = await self.db.execute(
            select(Event)
            .where(Event.project_id == uuid.UUID(project_id))
            .order_by(Event.created_at.desc())
            .limit(limit)
        )
        events = result.scalars().all()
        return [
            EventResponse(
                id=str(e.id),
                project_id=str(e.project_id),
                workspace_id=str(e.workspace_id) if e.workspace_id else None,
                event_type=e.event_type,
                title=e.title,
                description=e.description,
                agent_type=e.agent_type,
                metadata_json=e.metadata_json,
                created_at=e.created_at.isoformat() if e.created_at else None,
            )
            for e in events
        ]

    async def create(self, project_id: str, event_type: str, title: str,
                     agent_type: str | None = None, description: str | None = None,
                     workspace_id: str | None = None) -> EventResponse:
        event = Event(
            project_id=uuid.UUID(project_id),
            workspace_id=uuid.UUID(workspace_id) if workspace_id else None,
            event_type=event_type,
            title=title,
            description=description,
            agent_type=agent_type,
        )
        self.db.add(event)
        await self.db.flush()
        return EventResponse(
            id=str(event.id),
            project_id=str(event.project_id),
            workspace_id=str(event.workspace_id) if event.workspace_id else None,
            event_type=event.event_type,
            title=event.title,
            description=event.description,
            agent_type=event.agent_type,
            metadata_json=event.metadata_json,
            created_at=event.created_at.isoformat() if event.created_at else None,
        )
