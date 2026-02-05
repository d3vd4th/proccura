from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from config import settings
from config import settings
from proxy import auth, roles, tenants, users, permissions, vendor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Proccura API Gateway",
    description="API Gateway for Proccura Microservices",
    version="1.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include proxy routers
app.include_router(auth.router)
app.include_router(roles.router)
app.include_router(tenants.router)
app.include_router(users.router)
app.include_router(users.router)
app.include_router(permissions.router)
app.include_router(vendor.router)


@app.get("/")
def root():
    """Gateway root endpoint"""
    return {
        "service": "Proccura API Gateway",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "gateway"
    }


@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Starting Proccura API Gateway")
    logger.info(f"Auth Service: {settings.AUTH_SERVICE_URL}")
    logger.info(f"Vendor Service: {settings.VENDOR_SERVICE_URL}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Shutting down Proccura API Gateway")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )