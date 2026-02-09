from fastapi import Request, HTTPException
from jose import jwt, JWTError
import httpx
import logging

from config import settings
from route_config.permissions import get_required_permission
from services.permission_service import has_permission

logger = logging.getLogger(__name__)


async def get_tenant_access(user_id: str, tenant_id: str, is_super_admin: bool) -> dict:
    """
    Validate user has access to the specified tenant and get their role.
    Super admins have access to all tenants without a role.
    Returns: {"has_access": bool, "role_id": str | None}
    """
    # Super admin has access to all tenants
    if is_super_admin:
        return {"has_access": True, "role_id": None}
    
    # Call auth service to verify tenant access and get role
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.AUTH_SERVICE_URL}/api/v1/internal/users/{user_id}/tenants/{tenant_id}",
                timeout=5.0
            )
            if response.status_code == 200:
                data = response.json()
                return {"has_access": True, "role_id": data.get("role_id")}
            else:
                return {"has_access": False, "role_id": None}
                
    except httpx.RequestError as e:
        logger.error(f"Failed to connect to auth service: {e}")
        raise HTTPException(status_code=503, detail="Auth service unavailable")


async def require_auth(request: Request):
    """
    Validate JWT token and check permissions for the requested route.
    
    JWT contains: user_id, is_super_admin
    Role and Tenant context: Fetched via X-Tenant-ID header
    
    Injects user context into request.state for downstream use.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    
    try:
        scheme, token = auth_header.split()
        if scheme.lower() != 'bearer':
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        
        # Decode and validate JWT
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
    except (ValueError, JWTError) as e:
        logger.warning(f"JWT validation failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Extract claims from token (only user_id and is_super_admin)
    user_id = payload.get("sub")
    is_super_admin = payload.get("is_super_admin", False)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token: missing user ID")
    
    # Get tenant_id from header
    tenant_id = request.headers.get("X-Tenant-ID")
    role_id = None
    
    # Validate tenant access and get role if tenant_id is provided
    if tenant_id:
        tenant_access = await get_tenant_access(user_id, tenant_id, is_super_admin)
        if not tenant_access["has_access"]:
            raise HTTPException(
                status_code=403,
                detail="You don't have access to this organization"
            )
        role_id = tenant_access["role_id"]
    elif not is_super_admin:
        # Regular users must provide tenant_id
        raise HTTPException(
            status_code=400, 
            detail="X-Tenant-ID header is required"
        )
    
    # Store user info in request state
    request.state.user = {
        "id": user_id,
        "role_id": role_id,
        "tenant_id": tenant_id,
        "is_super_admin": is_super_admin
    }
    
    # Super admin bypasses permission checks
    if is_super_admin:
        logger.debug(f"Super admin {user_id} bypassing permission check")
        return
    
    # Get required permission for this route
    required_permission = get_required_permission(request.method, request.url.path)
    
    if required_permission:
        # Check if role has the required permission
        if not role_id:
            raise HTTPException(
                status_code=403, 
                detail="No role assigned to user"
            )
        
        has_perm = await has_permission(role_id, required_permission)
        
        if not has_perm:
            logger.warning(
                f"User {user_id} with role {role_id} denied access to {request.method} {request.url.path}. "
                f"Required permission: {required_permission}"
            )
            raise HTTPException(
                status_code=403, 
                detail=f"Missing permission: {required_permission}"
            )
        
        logger.debug(f"User {user_id} authorized for {required_permission}")
