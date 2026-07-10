import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base, engine, get_db
from app.main import app


@pytest.fixture(scope="session", autouse=True)
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


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
