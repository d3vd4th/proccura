from fastapi import APIRouter, Request
from config import settings
from proxy.base import proxy_request
from services.permission_service import invalidate_role_cache

router = APIRouter(tags=["Roles Proxy"])


@router.api_route(
    "/api/v1/roles/{path:path}", 
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def roles_proxy(path: str, request: Request):
    """
    Proxy all /api/v1/roles/* requests to auth service.
    On PUT or DELETE, invalidate the role's permission cache in Redis.
    """
    response = await proxy_request(
        request,
        settings.AUTH_SERVICE_URL,
        f"/api/v1/roles/{path}"
    )

    # Invalidate Redis cache when role is updated or deleted
    if request.method in ("PUT", "DELETE") and response.status_code < 400:
        # path could be "{role_id}" or "{role_id}/permissions"
        role_id = path.split("/")[0]
        if role_id:
            await invalidate_role_cache(role_id)

    return response


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