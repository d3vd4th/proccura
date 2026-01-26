from fastapi import APIRouter, Request
from config import settings
from proxy.base import proxy_request

router = APIRouter(tags=["Roles Proxy"])


@router.api_route(
    "/api/v1/roles/{path:path}", 
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def roles_proxy(path: str, request: Request):
    """
    Proxy all /api/v1/roles/* requests to auth service.
    
    Example:
        Gateway: GET /api/v1/roles
        Proxies to: GET http://localhost:8001/api/v1/roles
    """
    return await proxy_request(
        request,
        settings.AUTH_SERVICE_URL,
        f"/api/v1/roles/{path}"
    )


# Handle /api/v1/roles without trailing path
@router.api_route(
    "/api/v1/roles",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def roles_root(request: Request):
    """Handle requests to /api/v1/roles (no subpath)"""
    return await proxy_request(
        request,
        settings.AUTH_SERVICE_URL,
        "/api/v1/roles"
    )