from fastapi import APIRouter, Request, Depends
from config import settings
from proxy.base import proxy_request
from middleware.auth import require_auth

router = APIRouter(
    tags=["Vendor Proxy"],
    dependencies=[Depends(require_auth)]
)

@router.api_route(
    "/api/v1/invitations/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def vendor_proxy(path: str, request: Request):
    """Proxy /api/v1/invitations/* requests to vendor service"""
    return await proxy_request(
        request,
        settings.VENDOR_SERVICE_URL,
        f"/api/v1/invitations/{path}"
    )

@router.api_route(
    "/api/v1/invitations",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def vendor_root(request: Request):
    """Handle requests to /api/v1/invitations (no subpath)"""
    return await proxy_request(
        request,
        settings.VENDOR_SERVICE_URL,
        "/api/v1/invitations"
    )
