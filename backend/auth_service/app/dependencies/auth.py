from fastapi import Depends, HTTPException, status
from auth_service.app.models.user import User

def require_super_admin(current_user: User = Depends()):
    if not current_user.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required"
        )
    return current_user
