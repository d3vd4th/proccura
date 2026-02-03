from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
BASE_DIR = Path(__file__).resolve().parents[1]  # Go up to auth_service root
load_dotenv(BASE_DIR / ".env")

from fastapi import FastAPI
from app.api.v1.router import api_router
from app.core.database import engine, Base

# Import all models to register them with Base metadata
from app.models import (
    User, Tenant, TenantUser, Role, Permission,
    RolePermission, Feature, AuthLog, AuditLog
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Proccura Auth Service",
    description="Authentication and Authorization Microservice",
    version="1.0.0",
)

# Include API v1 router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "service": "proccura-auth-service",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/ready")
def readiness_check():
    """Readiness check - ensures DB connection"""
    try:
        from core.database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        return {"status": "not ready", "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )