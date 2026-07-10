import re

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "DevSquad AI"
    app_env: str = "development"
    debug: bool = True

    database_url: str = "sqlite+aiosqlite:///./devsquad.db"

    @field_validator("database_url")
    @classmethod
    def _normalize_database_url(cls, v: str) -> str:
        # Managed Postgres providers (Render, Heroku, Railway, ...) hand out
        # URLs using the "postgres://" or "postgresql://" scheme, but the async
        # engine requires the asyncpg driver. Coerce them to the right scheme.
        for prefix in ("postgres://", "postgresql://"):
            if v.startswith(prefix):
                v = "postgresql+asyncpg://" + v[len(prefix):]
                break
        # asyncpg does not understand libpq-style query params such as sslmode.
        if "+asyncpg" in v:
            v = re.sub(r"[?&]sslmode=[^&]*", "", v)
        return v

    jwt_secret: str = "change-this-to-a-random-secret-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080

    gemini_api_key: str | None = None

    cors_origins: str = "http://localhost:3000"

    google_client_id: str | None = None

    stripe_secret_key: str | None = None
    stripe_webhook_secret: str | None = None
    stripe_pro_price_id: str = "price_pro"
    stripe_enterprise_price_id: str = "price_enterprise"

    log_level: str = "INFO"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
