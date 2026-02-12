from fastapi import Request, HTTPException
from jose import jwt, JWTError

import logging

from config import settings
from route_config.permissions import get_required_permission
from services.permission_service import has_permission

logger = logging.getLogger(__name__)


async def require_auth(request: Request):
    """
    Validate JWT token and check permissions for the requested route.
    
    JWT contains: user_id, is_super_admin, tenant_id, role_id
    
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
    
    # Extract claims from token
    user_id = payload.get("sub")
    is_super_admin = payload.get("is_super_admin", False)
    token_tenant_id = payload.get("tenant_id")
    role_id = payload.get("role_id")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token: missing user ID")
    
    # Get tenant_id from header (Priority as requested)
    header_tenant_id = request.headers.get("X-Tenant-ID")
    
    # Determine effective tenant_id
    tenant_id = header_tenant_id
    
    # Validation logic
    if not is_super_admin:
        if not tenant_id:
             # If no header, maybe fallback to token? Or fail?
             # User said "taken form header".
             if token_tenant_id:
                 tenant_id = token_tenant_id
             else:
                 raise HTTPException(status_code=400, detail="X-Tenant-ID header is required")
        
        # If both exist, they should ideally match to prevent role spoofing
        # But if user insists on Header, we use Header.
        # However, if Token is scoped to Tenant A, and Header says B, 
        # using Role from Token (which is for A) on B is dangerous.
        if token_tenant_id and str(tenant_id) != str(token_tenant_id):
            logger.warning(f"Tenant mismatch: Header {tenant_id} vs Token {token_tenant_id}")
            raise HTTPException(status_code=403, detail="Token validation failed for this tenant")

    # Store user info in request state
    request.state.user = {
        "id": user_id,
        "email": payload.get("email"), 
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
