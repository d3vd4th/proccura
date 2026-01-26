from fastapi import APIRouter, Request
from config import settings
from proxy.base import proxy_request

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def auth_proxy(path: str, request: Request):
    return await proxy_request(
        request,
        settings.AUTH_SERVICE_URL,
        f"/auth/{path}"
    )
