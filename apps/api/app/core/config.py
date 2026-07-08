
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "DevSquad AI"
    app_env: str = "development"
    debug: bool = True

    database_url: str = "sqlite+aiosqlite:///./devsquad.db"

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
