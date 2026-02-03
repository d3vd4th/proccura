from sqlalchemy.orm import Session, joinedload
from app.models.permission import Permission
from app.models.feature import Feature


def list_permissions(db: Session, feature_id: str = None):
    """Get all permissions, optionally filtered by feature_id"""
    query = db.query(Permission).options(joinedload(Permission.feature))

    if feature_id:
        query = query.filter(Permission.feature_id == feature_id)

    return query.order_by(Permission.feature_id, Permission.code).all()


def get_permissions_grouped_by_feature(db: Session):
    """Get all permissions grouped by feature"""
    features = (
        db.query(Feature)
        .options(joinedload(Feature.permissions))
        .order_by(Feature.name)
        .all()
    )

    return features


def list_features(db: Session):
    """Get all features"""
    return db.query(Feature).order_by(Feature.name).all()
