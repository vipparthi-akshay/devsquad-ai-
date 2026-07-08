from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.agent import AgentDefinition
from app.models.user import User
from app.schemas.agent import AgentDefinitionResponse

router = APIRouter(prefix="/api/v1/agents", tags=["agents"])


@router.get("", response_model=list[AgentDefinitionResponse])
async def list_agents(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AgentDefinition))
    agents = result.scalars().all()
    return [
        AgentDefinitionResponse(
            id=str(a.id),
            name=a.name,
            agent_type=a.agent_type.value if hasattr(a.agent_type, 'value') else str(a.agent_type),
            description=a.description,
            role_description=a.role_description,
            capabilities=a.capabilities,
            is_active=a.is_active.value if hasattr(a.is_active, 'value') else str(a.is_active),
        )
        for a in agents
    ]
