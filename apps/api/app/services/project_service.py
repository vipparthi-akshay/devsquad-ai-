import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectResponse


class ProjectService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, req: ProjectCreate, user_id: str) -> ProjectResponse:
        project = Project(
            name=req.name,
            description=req.description,
            workspace_id=uuid.UUID(req.workspace_id),
        )
        self.db.add(project)
        await self.db.flush()

        event = Event(
            project_id=project.id,
            workspace_id=project.workspace_id,
            event_type="PROJECT_CREATED",
            title=f"Project created: {project.name}",
            agent_type=None,
        )
        self.db.add(event)
        await self.db.flush()

        return ProjectResponse(
            id=str(project.id),
            name=project.name,
            description=project.description,
            status=project.status,
            workspace_id=str(project.workspace_id),
            created_at=project.created_at.isoformat() if project.created_at else None,
            updated_at=project.updated_at.isoformat() if project.updated_at else None,
        )

    async def list_by_workspace(self, workspace_id: str) -> list[ProjectResponse]:
        result = await self.db.execute(
            select(Project).where(Project.workspace_id == uuid.UUID(workspace_id)).order_by(Project.created_at.desc())
        )
        projects = result.scalars().all()
        return [
            ProjectResponse(
                id=str(p.id),
                name=p.name,
                description=p.description,
                status=p.status,
                workspace_id=str(p.workspace_id),
                created_at=p.created_at.isoformat() if p.created_at else None,
                updated_at=p.updated_at.isoformat() if p.updated_at else None,
            )
            for p in projects
        ]

    async def get(self, project_id: str) -> ProjectResponse | None:
        result = await self.db.execute(
            select(Project).where(Project.id == uuid.UUID(project_id))
        )
        p = result.scalar_one_or_none()
        if p is None:
            return None
        return ProjectResponse(
            id=str(p.id),
            name=p.name,
            description=p.description,
            status=p.status,
            workspace_id=str(p.workspace_id),
            created_at=p.created_at.isoformat() if p.created_at else None,
            updated_at=p.updated_at.isoformat() if p.updated_at else None,
        )
