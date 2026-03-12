# config/settings.py
# ─────────────────────────────────────────────────────────────────────────────
# Centralised application settings loaded from environment variables.
# Uses pydantic-settings so every variable is type-checked at startup.
# ─────────────────────────────────────────────────────────────────────────────

from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    # ── Gemini / Google Generative AI ─────────────────────────────────────────
    GEMINI_API_KEY: str  # Required – set this in your .env file

    # ── File storage ──────────────────────────────────────────────────────────
    # Absolute path to the folder where uploaded PDFs will be persisted.
    UPLOAD_DIR: Path = Path(__file__).resolve().parent.parent / "uploads"

    # ── Gemini model selection ────────────────────────────────────────────────
    GEMINI_MODEL: str = "gemini-2.0-flash"

    class Config:
        # Load variables from a .env file in the project root at runtime.
        env_file = ".env"
        env_file_encoding = "utf-8"


# Module-level singleton – import this object everywhere you need settings.
settings = Settings()

# Ensure the uploads directory exists on application start.
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
