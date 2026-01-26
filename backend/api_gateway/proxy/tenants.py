from fastapi import APIRouter, Request, Depends
from config import settings
from proxy.base import proxy_request
from middleware.auth import require_auth

router = APIRouter(
    prefix="/tenants",
    tags=["Tenants"],
    dependencies=[Depends(require_auth)]
)

@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def tenants_proxy(path: str, request: Request):
    return await proxy_request(
        request,
        settings.TENANT_SERVICE_URL,
        f"/tenants/{path}"
    )
