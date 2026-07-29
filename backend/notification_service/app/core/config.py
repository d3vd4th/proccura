from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Resend
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "Proccura <onboarding@resend.dev>"

    # Frontend URL for email links
    FRONTEND_URL: str = "http://localhost:5173"

    # Kafka
    KAFKA_BOOTSTRAP_SERVERS: str = "kafka:9092"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
