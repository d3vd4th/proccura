from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Proccura API Gateway"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    AUTH_SERVICE_URL: str
    TENANT_SERVICE_URL: str
    USER_SERVICE_URL: str
    ORDER_SERVICE_URL: str
    VENDOR_SERVICE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
