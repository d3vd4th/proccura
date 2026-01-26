from fastapi import APIRouter, Request
from config import settings
from proxy.base import proxy_request

router = APIRouter(tags=["Tenants Proxy"])


@router.api_route(
    "/api/v1/tenants/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def tenants_proxy(path: str, request: Request):
    """Proxy all /api/v1/tenants/* requests to auth service"""
    return await proxy_request(
        request,
        settings.AUTH_SERVICE_URL,
        f"/api/v1/tenants/{path}"
    )


@router.api_route(
    "/api/v1/tenants",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def tenants_root(request: Request):
    """Handle requests to /api/v1/tenants (no subpath)"""
    return await proxy_request(
        request,
        settings.AUTH_SERVICE_URL,
        "/api/v1/tenants"
    )