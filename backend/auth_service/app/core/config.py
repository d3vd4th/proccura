from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Resend
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "Proccura <onboarding@resend.dev>"

    # Internal service-to-service auth
    INTERNAL_API_KEY: str = "dev-internal-key"

    class Config:
        env_file = ".env"

settings = Settings()
