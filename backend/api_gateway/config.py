from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Gateway Config
    APP_NAME: str = "Proccura API Gateway"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]
    
    # JWT
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD: int = 60  # seconds
    
    # Service URLs (Internal - not exposed to public)
    AUTH_SERVICE_URL: str = "http://localhost:8001"
    TENANT_SERVICE_URL: str = "http://localhost:8002"
    USER_SERVICE_URL: str = "http://localhost:8003"
    ORDER_SERVICE_URL: str = "http://localhost:8004"
    
    # Timeouts
    SERVICE_TIMEOUT: int = 30  # seconds
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()