import asyncio
import os

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
os.environ.setdefault("JWT_SECRET", "test")
os.environ.setdefault("APP_ENV", "test")

from app.core.config import settings
from app.core.database import Base, engine


async def main():
    print(f"DB URL: {settings.database_url}")
    try:
        async with engine.begin() as conn:
            print("DB CONNECTION OK")
            await conn.run_sync(Base.metadata.create_all)
            print("SCHEMA CREATED OK")
    except Exception as e:
        print(f"DB ERROR: {type(e).__name__}: {e}")
        raise


asyncio.run(main())
