import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "0.1.0", "app": settings.app_name}


from app.api.v1.agents import router as agents_router
from app.api.v1.approvals import router as approvals_router
from app.api.v1.architecture import router as architecture_router
from app.api.v1.auth import router as auth_router
from app.api.v1.demo import router as demo_router
from app.api.v1.events import router as events_router
from app.api.v1.payments import router as payments_router
from app.api.v1.projects import router as projects_router
from app.api.v1.requirements import router as requirements_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.workflows import router as workflows_router
from app.api.v1.workspaces import router as workspaces_router

app.include_router(auth_router)
app.include_router(workspaces_router)
app.include_router(projects_router)
app.include_router(requirements_router)
app.include_router(architecture_router)
app.include_router(workflows_router)
app.include_router(approvals_router)
app.include_router(events_router)
app.include_router(agents_router)
app.include_router(tasks_router)
app.include_router(demo_router)
app.include_router(payments_router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "request_id": str(uuid.uuid4())},
    )
