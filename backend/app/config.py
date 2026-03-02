"""HealthScan — Configuration"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = "HealthScan"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # AI Provider: "gemini" or "openai"
    AI_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Upload
    MAX_FILE_SIZE_MB: int = 10
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")

    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'healthscan.db'}"

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
