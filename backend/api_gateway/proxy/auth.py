from fastapi import APIRouter, Request
from config import settings
from proxy.base import proxy_request

router = APIRouter(tags=["Auth Proxy"])


@router.api_route(
    "/api/v1/auth/{path:path}", 
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def auth_proxy(path: str, request: Request):
    return await proxy_request(
        request,
        settings.AUTH_SERVICE_URL,
        f"/api/v1/auth/{path}"
    )