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


@router.api_route(
    "/api/v1/vendor-registrations/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def vendor_registrations_proxy(path: str, request: Request):
    """Proxy /api/v1/vendor-registrations/* requests to vendor service"""
    return await proxy_request(
        request,
        settings.VENDOR_SERVICE_URL,
        f"/api/v1/vendor-registrations/{path}"
    )


@router.api_route(
    "/api/v1/vendor-registrations",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def vendor_registrations_root(request: Request):
    """Handle requests to /api/v1/vendor-registrations (no subpath)"""
    return await proxy_request(
        request,
        settings.VENDOR_SERVICE_URL,
        "/api/v1/vendor-registrations"
    )

@router.api_route(
    "/api/v1/vendor-portal/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def vendor_portal_proxy(path: str, request: Request):
    """Proxy /api/v1/vendor-portal/* requests to vendor service"""
    return await proxy_request(
        request,
        settings.VENDOR_SERVICE_URL,
        f"/api/v1/vendor-portal/{path}"
    )

@router.api_route(
    "/api/v1/vendor-portal",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def vendor_portal_root(request: Request):
    """Handle requests to /api/v1/vendor-portal (no subpath)"""
    return await proxy_request(
        request,
        settings.VENDOR_SERVICE_URL,
        "/api/v1/vendor-portal"
    )

@router.api_route(
    "/api/v1/questionnaires/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def questionnaires_proxy(path: str, request: Request):
    """Proxy /api/v1/questionnaires/* requests to vendor service"""
    return await proxy_request(
        request,
        settings.VENDOR_SERVICE_URL,
        f"/api/v1/questionnaires/{path}"
    )

@router.api_route(
    "/api/v1/questionnaires",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def questionnaires_root(request: Request):
    """Handle requests to /api/v1/questionnaires (no subpath)"""
    return await proxy_request(
        request,
        settings.VENDOR_SERVICE_URL,
        "/api/v1/questionnaires"
    )

@router.api_route(
    "/api/v1/vendors/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def vendors_proxy(path: str, request: Request):
    """Proxy /api/v1/vendors/* requests to vendor service"""
    return await proxy_request(
        request,
        settings.VENDOR_SERVICE_URL,
        f"/api/v1/vendors/{path}"
    )

@router.api_route(
    "/api/v1/vendors",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
async def vendors_root(request: Request):
    """Handle requests to /api/v1/vendors (no subpath)"""
    return await proxy_request(
        request,
        settings.VENDOR_SERVICE_URL,
        "/api/v1/vendors"
    )
