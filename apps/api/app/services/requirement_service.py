import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event
from app.models.requirement import Requirement
from app.schemas.requirement import RequirementCreate, RequirementResponse


class RequirementService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, req: RequirementCreate) -> RequirementResponse:
        requirement = Requirement(
            project_id=uuid.UUID(req.project_id),
            input_text=req.input_text,
        )
        self.db.add(requirement)
        await self.db.flush()

        event = Event(
            project_id=requirement.project_id,
            event_type="REQUIREMENT_CREATED",
            title="Requirements analysis requested",
            agent_type="REQUIREMENTS_ANALYST",
        )
        self.db.add(event)
        await self.db.flush()

        return RequirementResponse(
            id=str(requirement.id),
            project_id=str(requirement.project_id),
            input_text=requirement.input_text,
            status=requirement.status,
            version=requirement.version,
            created_at=requirement.created_at.isoformat() if requirement.created_at else None,
        )

    async def get_by_project(self, project_id: str) -> list[RequirementResponse]:
        result = await self.db.execute(
            select(Requirement).where(Requirement.project_id == uuid.UUID(project_id)).order_by(Requirement.created_at.desc())
        )
        reqs = result.scalars().all()
        return [self._to_response(r) for r in reqs]

    async def update(self, req_id: str, updates: dict) -> RequirementResponse | None:
        result = await self.db.execute(select(Requirement).where(Requirement.id == uuid.UUID(req_id)))
        req = result.scalar_one_or_none()
        if req is None:
            return None
        for key, value in updates.items():
            if hasattr(req, key):
                setattr(req, key, value)
        await self.db.flush()
        return self._to_response(req)

    def _to_response(self, r: Requirement) -> RequirementResponse:
        return RequirementResponse(
            id=str(r.id),
            project_id=str(r.project_id),
            input_text=r.input_text,
            problem_statement=r.problem_statement,
            personas=r.personas,
            user_journeys=r.user_journeys,
            functional_requirements=r.functional_requirements,
            non_functional_requirements=r.non_functional_requirements,
            assumptions=r.assumptions,
            constraints=r.constraints,
            risks=r.risks,
            acceptance_criteria=r.acceptance_criteria,
            mvp_scope=r.mvp_scope,
            future_scope=r.future_scope,
            status=r.status,
            version=r.version,
            created_at=r.created_at.isoformat() if r.created_at else None,
        )
