import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text

from app.core.database import Base, engine
from app.main import app


@pytest.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        if engine.dialect.name == "postgresql":
            rows = (await conn.execute(
                text("SELECT typname FROM pg_type WHERE typtype = 'e'")
            )).fetchall()
            for (typname,) in rows:
                await conn.execute(text(f"DROP TYPE IF EXISTS \"{typname}\" CASCADE"))


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
