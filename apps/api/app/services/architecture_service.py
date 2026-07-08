import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.architecture import Architecture
from app.models.event import Event
from app.schemas.architecture import ArchitectureCreate, ArchitectureResponse


class ArchitectureService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, req: ArchitectureCreate) -> ArchitectureResponse:
        arch = Architecture(
            project_id=uuid.UUID(req.project_id),
        )
        self.db.add(arch)
        await self.db.flush()

        event = Event(
            project_id=arch.project_id,
            event_type="ARCHITECTURE_CREATED",
            title="Architecture analysis started",
            agent_type="SYSTEM_ARCHITECT",
        )
        self.db.add(event)
        await self.db.flush()

        return self._to_response(arch)

    async def get_by_project(self, project_id: str) -> list[ArchitectureResponse]:
        result = await self.db.execute(
            select(Architecture).where(Architecture.project_id == uuid.UUID(project_id)).order_by(Architecture.created_at.desc())
        )
        archs = result.scalars().all()
        return [self._to_response(a) for a in archs]

    async def update(self, arch_id: str, updates: dict) -> ArchitectureResponse | None:
        result = await self.db.execute(select(Architecture).where(Architecture.id == uuid.UUID(arch_id)))
        arch = result.scalar_one_or_none()
        if arch is None:
            return None
        for key, value in updates.items():
            if hasattr(arch, key):
                setattr(arch, key, value)
        await self.db.flush()
        return self._to_response(arch)

    def _to_response(self, a: Architecture) -> ArchitectureResponse:
        return ArchitectureResponse(
            id=str(a.id),
            project_id=str(a.project_id),
            summary=a.summary,
            component_model=a.component_model,
            deployment_model=a.deployment_model,
            api_boundaries=a.api_boundaries,
            data_flow=a.data_flow,
            risks=a.risks,
            alternatives=a.alternatives,
            decisions=a.decisions,
            mermaid_diagram=a.mermaid_diagram,
            status=a.status,
            created_at=a.created_at.isoformat() if a.created_at else None,
        )
