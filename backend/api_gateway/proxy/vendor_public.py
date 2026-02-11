from fastapi import APIRouter, Request
from config import settings
from proxy.base import proxy_request

# No auth dependency — these are public endpoints for vendor registration
router = APIRouter(tags=["Vendor Registration (Public)"])

@router.api_route(
    "/api/v1/register/{path:path}",
    methods=["GET", "POST"]
)
async def registration_proxy(path: str, request: Request):
    """Proxy /api/v1/register/* to vendor service — public, no auth"""
    return await proxy_request(
        request,
        settings.VENDOR_SERVICE_URL,
        f"/api/v1/register/{path}"
    )
