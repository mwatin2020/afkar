from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Private Task & Idea Vault API"
    app_env: str = "development"
    backend_host: str = "127.0.0.1"
    backend_port: int = 8000
    database_url: str = "postgresql+asyncpg://vault_user:vault_password@localhost:5433/private_vault"
    sync_database_url: str = "postgresql://vault_user:vault_password@localhost:5433/private_vault"
    jwt_secret: str = "change-me-locally"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    cors_origins: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
