from fastapi import APIRouter, Request, HTTPException
from typing import Optional
from api_gateway.config import settings
from api_gateway.utils.http_client import service_client
from api_gateway.utils.jwt import get_user_from_token

router = APIRouter()


# Service routing map
SERVICE_ROUTES = {
    "/roles": settings.AUTH_SERVICE_URL,
    "/users": settings.AUTH_SERVICE_URL,
    "/permissions": settings.AUTH_SERVICE_URL,
    "/tenants": settings.TENANT_SERVICE_URL,
    "/orders": settings.ORDER_SERVICE_URL,
}


def get_service_url(path: str) -> Optional[str]:
    """Determine which service to route to based on path"""
    for route_prefix, service_url in SERVICE_ROUTES.items():
        if path.startswith(route_prefix):
            return service_url
    return None


async def proxy_to_service(request: Request, path: str):
    """Generic proxy handler for all protected routes"""
    # Verify authentication
    authorization = request.headers.get("Authorization", "")
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")
    
    # Verify token (will raise exception if invalid)
    user_payload = get_user_from_token(authorization)
    
    # Determine target service
    service_url = get_service_url(f"/{path}")
    if not service_url:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Get request body if present
    body = None
    if request.method in ["POST", "PUT", "PATCH"]:
        try:
            body = await request.json()
        except:
            pass
    
    # Forward headers (add user context)
    headers = {
        "Authorization": authorization,
        "X-User-ID": user_payload.get("sub"),
        "X-Tenant-ID": user_payload.get("tenant_id", ""),
        "X-User-Email": user_payload.get("email", ""),
    }
    
    # Proxy request
    response = await service_client.proxy_request(
        service_url=service_url,
        path=f"/api/v1/{path}",
        method=request.method,
        headers=headers,
        json=body,
        params=dict(request.query_params)
    )
    
    return response


# Dynamic routes for all HTTP methods
@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def catch_all(request: Request, path: str):
    """Catch-all route that proxies to appropriate service"""
    return await proxy_to_service(request, path)