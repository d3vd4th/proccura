from sqlalchemy.orm import Session
from app.models.auth_log import AuthLog


class AuthAction:
    LOGIN_SUCCESS = "LOGIN_SUCCESS"
    LOGIN_FAILED = "LOGIN_FAILED"
    LOGOUT = "LOGOUT"
    TOKEN_REFRESH = "TOKEN_REFRESH"
    PASSWORD_CHANGE = "PASSWORD_CHANGE"
    PASSWORD_RESET_REQUEST = "PASSWORD_RESET_REQUEST"
    PASSWORD_RESET_COMPLETE = "PASSWORD_RESET_COMPLETE"


def log_auth_event(
    db: Session,
    action: str,
    user_id: str = None,
    tenant_id: str = None,
    ip_address: str = None,
    user_agent: str = None,
    details: dict = None,
):
    """Log an authentication event"""
    auth_log = AuthLog(
        user_id=user_id,
        tenant_id=tenant_id,
        action=action,
        ip_address=ip_address,
        user_agent=user_agent,
        details=details,
    )
    db.add(auth_log)
    db.commit()
    return auth_log


def get_auth_logs(
    db: Session,
    user_id: str = None,
    tenant_id: str = None,
    action: str = None,
    limit: int = 100,
):
    """Get auth logs with optional filters"""
    query = db.query(AuthLog)

    if user_id:
        query = query.filter(AuthLog.user_id == user_id)
    if tenant_id:
        query = query.filter(AuthLog.tenant_id == tenant_id)
    if action:
        query = query.filter(AuthLog.action == action)

    return query.order_by(AuthLog.created_at.desc()).limit(limit).all()
