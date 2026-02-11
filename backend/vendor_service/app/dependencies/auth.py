"""
Auth dependencies for Vendor Service.
Reads user context from trusted gateway headers.
"""
from fastapi import Request, HTTPException, Header
from typing import Optional


class UserContext:
    """User context extracted from gateway headers."""
    def __init__(
        self,
        user_id: str,
        tenant_id: str,
        email: Optional[str] = None,
        role_id: Optional[str] = None,
        is_super_admin: bool = False
    ):
        self.id = user_id
        self.email = email
        self.tenant_id = tenant_id
        self.role_id = role_id
        self.is_super_admin = is_super_admin


def get_current_user(request: Request) -> UserContext:
    """
    Extract user context from gateway-injected request state.
    The gateway validates the JWT and stores user info in request.state.
    """
    user = getattr(request.state, 'user', None)
    
    if not user:
        # Fallback: try headers (in case gateway forwards via headers)
        user_id = request.headers.get("X-User-ID")
        email = request.headers.get("X-User-Email")
        tenant_id = request.headers.get("X-Tenant-ID")
        role_id = request.headers.get("X-Role-ID")
        is_super_admin = request.headers.get("X-Is-Super-Admin", "false").lower() == "true"
        
        if not user_id:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        return UserContext(
            user_id=user_id,
            email=email,
            tenant_id=tenant_id,
            role_id=role_id,
            is_super_admin=is_super_admin
        )
    
    return UserContext(
        user_id=user.get("id"),
        email=user.get("email"),
        tenant_id=user.get("tenant_id"),
        role_id=user.get("role_id"),
        is_super_admin=user.get("is_super_admin", False)
    )


def get_tenant_id(
    x_tenant_id: str = Header(..., alias="X-Tenant-ID")
) -> str:
    """Get tenant ID from header."""
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="Missing X-Tenant-ID header")
    return x_tenant_id
