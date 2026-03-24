from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.auth import (
    LoginRequest, RefreshTokenRequest, TokenResponse,
    CheckEmailRequest, CheckEmailResponse, TenantInfo,
    PasswordResetRequest, PasswordResetConfirm
)
from app.schemas.auth_log import AuthLogResponse
from app.services.auth_service import (
    authenticate_user, issue_tokens, refresh_access_token, check_email_for_tenants
)
from app.services.auth_log_service import log_auth_event, get_auth_logs, AuthAction
from app.dependencies.auth import get_current_user
from app.api.deps import get_db

router = APIRouter()


def get_client_ip(request: Request) -> str:
    """Extract client IP from request headers or connection"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


@router.post("/check-email", response_model=CheckEmailResponse)
def check_email(
    payload: CheckEmailRequest,
    db: Session = Depends(get_db),
):
    """
    Step 1 of login: Check if email exists and return user's tenants.
    Super admins can see all tenants.
    """
    user_exists, is_super_admin, tenant_list, requires_reset = check_email_for_tenants(db, payload.email)
    
    tenants = [
        TenantInfo(id=t["id"], name=t["name"], logo_url=t["logo_url"])
        for t in tenant_list
    ]
    
    return CheckEmailResponse(
        user_exists=user_exists,
        is_super_admin=is_super_admin,
        tenants=tenants,
        requires_password_reset=requires_reset
    )


@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    ip_address = get_client_ip(request)
    user_agent = request.headers.get("User-Agent")

    try:
        user = authenticate_user(db, payload.email, payload.password, payload.tenant_id)
        access_token, refresh_token = issue_tokens(user)

        # Log successful login
        log_auth_event(
            db=db,
            action=AuthAction.LOGIN_SUCCESS,
            user_id=user.id,
            tenant_id=user.tenant_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details={"email": payload.email},
        )

        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_active": user.is_active,
                "is_super_admin": user.is_super_admin,
                "profile_pic_url": user.profile_pic_url,
                "tenant_id": user.tenant_id,
                "user_type": getattr(user, "user_type", "INTERNAL"),
            },
            "access_token": access_token,
            "refresh_token": refresh_token,
        }
    except HTTPException as e:
        # Log failed login attempt
        log_auth_event(
            db=db,
            action=AuthAction.LOGIN_FAILED,
            ip_address=ip_address,
            user_agent=user_agent,
            details={"email": payload.email, "reason": e.detail},
        )
        raise


@router.post("/logout", status_code=204)
def logout(
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    ip_address = get_client_ip(request)
    user_agent = request.headers.get("User-Agent")

    log_auth_event(
        db=db,
        action=AuthAction.LOGOUT,
        user_id=current_user.id,
        ip_address=ip_address,
        user_agent=user_agent,
    )

    return None


@router.get("/me")
def get_current_user_info(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get current authenticated user info with permissions"""
    from app.models.tenant_user import TenantUser
    from app.models.role_permission import RolePermission
    from app.models.permission import Permission
    from app.models.role import Role

    # Get tenant_user for the user
    tenant_user = (
        db.query(TenantUser)
        .filter(TenantUser.user_id == current_user.id)
        .first()
    )

    # Get role name and permissions
    role_name = None
    permissions = []
    if tenant_user and tenant_user.role_id:
        role = db.query(Role).filter(Role.id == tenant_user.role_id).first()
        role_name = role.name if role else None

        permission_codes = (
            db.query(Permission.code)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .filter(RolePermission.role_id == tenant_user.role_id)
            .all()
        )
        permissions = [p[0] for p in permission_codes]

    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "is_active": current_user.is_active,
        "is_super_admin": current_user.is_super_admin,
        "profile_pic_url": current_user.profile_pic_url,
        "tenant_id": tenant_user.tenant_id if tenant_user else None,
        "role_id": tenant_user.role_id if tenant_user else None,
        "role_name": role_name,
        "user_type": tenant_user.user_type.value if tenant_user and tenant_user.user_type else "INTERNAL",
        "permissions": permissions,
    }


@router.post("/refresh")
def refresh_token(
    payload: RefreshTokenRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    ip_address = get_client_ip(request)
    user_agent = request.headers.get("User-Agent")

    access_token = refresh_access_token(db, payload.refresh_token)

    # Log token refresh
    log_auth_event(
        db=db,
        action=AuthAction.TOKEN_REFRESH,
        ip_address=ip_address,
        user_agent=user_agent,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/logs", response_model=list[AuthLogResponse])
def get_user_auth_logs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    limit: int = 50,
):
    """Get auth logs for the current user"""
    return get_auth_logs(db, user_id=current_user.id, limit=limit)

@router.get("/health")
def health_check():
    """Health check endpoint for API Gateway"""
    return {"status": "healthy", "service": "auth"}

@router.post("/request-password-reset")
def request_password_reset(
    payload: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    from app.models.user import User
    from app.core.security import create_password_reset_token

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Don't reveal if user exists or not for security, just return success
        return {"detail": "If the email is highly valid, a reset link will be sent."}
    
    user.requires_password_reset = True
    db.commit()

    reset_token = create_password_reset_token(user.email)
    
    # Dev mode: print reset token
    print(f"\n{'='*60}")
    print(f"🔑 PASSWORD RESET REQUESTED (Dev Mode)")
    print(f"   Email: {user.email}")
    print(f"   Set Password Link: http://localhost:3000/set-password?token={reset_token}")
    print(f"{'='*60}\n")

    return {"detail": "Password reset instructions sent"}

@router.post("/reset-password")
def reset_password(
    payload: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    from app.models.user import User
    from app.core.security import decode_token, hash_password
    from jose import JWTError

    try:
        decoded = decode_token(payload.token)
        if decoded.get("type") != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid token type")
        email = decoded.get("sub")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(payload.new_password)
    user.requires_password_reset = False
    db.commit()

    return {"detail": "Password successfully reset"}
