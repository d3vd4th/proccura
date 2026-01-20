from fastapi import APIRouter
import httpx
from api_gateway.config import settings

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
    """Check if gateway and all services are ready"""
    services_status = {}
    all_healthy = True
    
    # Check each backend service
    services = {
        "auth": settings.AUTH_SERVICE_URL,
        "tenant": settings.TENANT_SERVICE_URL,
        "user": settings.USER_SERVICE_URL,
        "order": settings.ORDER_SERVICE_URL,
    }
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        for service_name, service_url in services.items():
            try:
                response = await client.get(f"{service_url}/health")
                services_status[service_name] = {
                    "status": "healthy" if response.status_code == 200 else "unhealthy",
                    "url": service_url
                }
            except Exception as e:
                services_status[service_name] = {
                    "status": "unreachable",
                    "url": service_url,
                    "error": str(e)
                }
                all_healthy = False
    
    return {
        "status": "ready" if all_healthy else "degraded",
        "gateway": "healthy",
        "services": services_status
    }