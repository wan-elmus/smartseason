from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    # Project
    PROJECT_NAME: str = "SmartSeason Field Monitoring System"
    VERSION: str = "1.0.1"
    ENVIRONMENT: str = "development"

    # Server
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int
    SERVER_RELOAD: bool = False

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = []

    # Database
    POSTGRES_HOST: str
    POSTGRES_PORT: int
    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    DATABASE_SSL_MODE: str = "require"

    # JWT / Auth
    JWT_SECRET: str
    JWT_ALGORITHM: str
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int
    RESET_TOKEN_EXPIRE_MINUTES: int

    # # External APIs
    # WEATHER_API_KEY: Optional[str] = None
    # OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com"

    LOG_LEVEL: str = "INFO"

    @property
    def DATABASE_URL(self) -> str:
        """Async URL for asyncpg driver"""
        base_url = f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        
        if hasattr(self, 'DATABASE_SSL_MODE') and self.DATABASE_SSL_MODE:
            return f"{base_url}?ssl={self.DATABASE_SSL_MODE}"
        return base_url

    @property
    def DATABASE_URL_SYNC(self) -> str:
        """Sync URL for psycopg2 driver (migrations)"""
        base_url = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        
        if hasattr(self, 'DATABASE_SSL_MODE') and self.DATABASE_SSL_MODE:
            return f"{base_url}?sslmode={self.DATABASE_SSL_MODE}"
        return base_url

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            if not v:
                return []
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                v = v[1:-1]
            return [origin.strip().strip('"').strip("'") for origin in v.split(",") if origin.strip()]
        return v or []

    @field_validator("SERVER_RELOAD", mode="before")
    @classmethod
    def reload_only_in_dev(cls, v, values):
        env = values.data.get("ENVIRONMENT", "development").lower()
        return v if env == "development" else False

    @field_validator("JWT_SECRET")
    @classmethod
    def ensure_jwt_secret_strength(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError("JWT_SECRET must be at least 32 characters long")
        return v

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",
    }


settings = Settings()