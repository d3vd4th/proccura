from fastapi import APIRouter
import httpx
from config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    """Gateway health check"""
    return {
        "status": "healthy",
        "service": "api-gateway",
        "version": settings.VERSION
    }


@router.get("/ready")
async def readiness_check():
    """Check if gateway and backend services are ready"""
    services_status = {}
    all_healthy = True
    
    # Check auth service
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{settings.AUTH_SERVICE_URL}/health")
            services_status["auth"] = {
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "url": settings.AUTH_SERVICE_URL
            }
    except Exception as e:
        services_status["auth"] = {
            "status": "unreachable",
            "url": settings.AUTH_SERVICE_URL,
            "error": str(e)
        }
        all_healthy = False
    
    # Add more services here as you create them
    
    return {
        "status": "ready" if all_healthy else "degraded",
        "gateway": "healthy",
        "services": services_status
    }