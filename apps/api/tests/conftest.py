import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from app.core.config import settings
from app.core.database import Base, engine, get_db
from app.main import app


@pytest.fixture(scope="session")
def event_loop():
    """Create a session-scoped event loop for async fixtures."""
    import asyncio
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    yield loop
    loop.close()


@pytest.fixture(scope="session", autouse=True)
async def setup_engine(event_loop):
    """Create tables once. Use a fresh engine to avoid event-loop conflicts."""
    engine = create_async_engine(settings.database_url, echo=settings.debug)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        if "postgresql" in str(engine.url):
            rows = (await conn.execute(
                text("SELECT typname FROM pg_type WHERE typtype = 'e'")
            )).fetchall()
            for (typname,) in rows:
                await conn.execute(text(f"DROP TYPE IF EXISTS \"{typname}\" CASCADE"))
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()


@pytest.fixture(autouse=True)
async def transaction():
    conn = await engine.connect()
    trans = await conn.begin()
    session = AsyncSession(bind=conn)

    async def override_get_db():
        yield session

    app.dependency_overrides[get_db] = override_get_db
    yield
    await trans.rollback()
    await conn.close()
    app.dependency_overrides.clear()


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
