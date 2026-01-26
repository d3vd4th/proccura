from fastapi import APIRouter, Request
from config import settings
from proxy.base import proxy_request

router = APIRouter(tags=["Users Proxy"])


@router.api_route(
    "/api/v1/users/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def users_proxy(path: str, request: Request):
    """Proxy all /api/v1/users/* requests to auth service"""
    return await proxy_request(
        request,
        settings.AUTH_SERVICE_URL,
        f"/api/v1/users/{path}"
    )


@router.api_route(
    "/api/v1/users",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def users_root(request: Request):
    """Handle requests to /api/v1/users (no subpath)"""
    return await proxy_request(
        request,
        settings.AUTH_SERVICE_URL,
        "/api/v1/users"
    )