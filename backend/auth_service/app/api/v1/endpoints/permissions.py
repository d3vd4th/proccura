from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.schemas.permission import (
    PermissionResponse,
    FeatureResponse,
    FeatureWithPermissionsResponse,
)
from app.services.permission_service import (
    list_permissions,
    get_permissions_grouped_by_feature,
    list_features,
)
from app.dependencies.auth import get_current_user
from app.api.deps import get_db


router = APIRouter()


@router.get(
    "",
    response_model=list[PermissionResponse],
    dependencies=[Depends(get_current_user)],
)
def list_permissions_api(
    feature_id: Optional[str] = Query(None, description="Filter by feature ID"),
    db: Session = Depends(get_db),
):
    """Get all available permissions"""
    return list_permissions(db, feature_id)


@router.get(
    "/grouped",
    response_model=list[FeatureWithPermissionsResponse],
    dependencies=[Depends(get_current_user)],
)
def list_permissions_grouped_api(
    db: Session = Depends(get_db),
):
    """Get all permissions grouped by feature"""
    return get_permissions_grouped_by_feature(db)


@router.get(
    "/features",
    response_model=list[FeatureResponse],
    dependencies=[Depends(get_current_user)],
)
def list_features_api(
    db: Session = Depends(get_db),
):
    """Get all features"""
    return list_features(db)
