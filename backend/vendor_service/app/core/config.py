from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    DB_SCHEMA: str = "vendor_schema"
    
    class Config:
        env_file = ".env"

settings = Settings()
