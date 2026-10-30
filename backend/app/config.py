import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    PROJECT_NAME: str = "YouFix API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development")
    PORT: int = Field(default=8000)

    # Google Gemini Vision API Configuration
    GEMINI_API_KEY: str = Field(default="", description="Google Gemini API Key")
    GEMINI_MODEL: str = Field(default="gemini-3.8-flash", description="Gemini Vision Model identifier")

    # Supabase Configuration
    SUPABASE_URL: str = Field(default="", description="Supabase project URL")
    SUPABASE_KEY: str = Field(default="", description="Supabase Anon or Service Role Key")
    SUPABASE_BUCKET: str = Field(default="diagnosis-images", description="Storage bucket for uploaded images")

    # Allowed CORS Origins (supports comma-separated list or wildcard)
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:3000,http://localhost:3001,https://*.vercel.app,*",
        description="Allowed CORS origins"
    )

    # Enable mock fallbacks if API keys are not supplied during local Capstone grading
    ENABLE_MOCK_FALLBACK: bool = Field(
        default=True,
        description="Whether to use mock diagnosis/storage when real API keys are missing"
    )

    @property
    def cors_origins(self) -> List[str]:
        """Parse ALLOWED_ORIGINS string into a list of origins for CORS middleware."""
        origins = [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]
        if "*" in origins:
            return ["*"]
        return origins

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"


settings = Settings()
