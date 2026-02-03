from fastapi import APIRouter, Request
from config import settings
from proxy.base import proxy_request

router = APIRouter(tags=["Permissions Proxy"])


@router.api_route(
    "/api/v1/permissions/{path:path}", 
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def permissions_proxy(path: str, request: Request):
    """
    Proxy all /api/v1/permissions/* requests to auth service.
    
    Example:
        Gateway: GET /api/v1/permissions/grouped
        Proxies to: GET http://localhost:8001/api/v1/permissions/grouped
    """
    return await proxy_request(
        request,
        settings.AUTH_SERVICE_URL,
        f"/api/v1/permissions/{path}"
    )


@router.api_route(
    "/api/v1/permissions",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def permissions_root(request: Request):
    """Handle requests to /api/v1/permissions (no subpath)"""
    return await proxy_request(
        request,
        settings.AUTH_SERVICE_URL,
        "/api/v1/permissions"
    )
