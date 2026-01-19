from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from shared.database import SessionLocal
from auth_service.app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
)
from auth_service.app.services.user_service import (
    create_user,
    list_users,
    update_user,
)
from auth_service.app.dependencies.tenant import get_current_tenant
from auth_service.app.dependencies.permissions import require_permission
from auth_service.app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post(
    "",
    response_model=UserResponse,
    status_code=201,
    dependencies=[Depends(require_permission("user.create"))],
)
def create_user_api(
    payload: UserCreate,
    tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db),
):
    return create_user(db, tenant.id, payload)


@router.get(
    "",
    response_model=list[UserResponse],
    dependencies=[Depends(require_permission("user.read"))],
)
def list_users_api(
    tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db),
):
    return list_users(db, tenant.id)

@router.put(
    "/{user_id}",
    response_model=UserResponse,
    dependencies=[Depends(require_permission("user.update"))],
)
def update_user_api(
    user_id: str,
    payload: UserUpdate,
    tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return update_user(db, user, payload)

