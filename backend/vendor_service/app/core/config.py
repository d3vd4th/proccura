from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str

    # Resend
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "Proccura <onboarding@resend.dev>"

    # Frontend URL for invitation links
    FRONTEND_URL: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
