from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Gateway
    API_GATEWAY_URL: str = "http://localhost:8000"

    # Resend
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "Proccura <onboarding@resend.dev>"

    class Config:
        env_file = ".env"

settings = Settings()
