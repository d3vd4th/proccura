from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
import math

from app.core.database import get_db
from app.dependencies.auth import get_tenant_id
from app.schemas.vendor import PaginatedVendors, VendorOut
from app.services.vendor_service import VendorService

router = APIRouter()

@router.get("", response_model=PaginatedVendors)
def list_vendors(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    """
    List all active vendors for the current tenant.
    """
    skip = (page - 1) * limit
    vendors, total = VendorService.get_vendors(
        db=db,
        tenant_id=tenant_id,
        skip=skip,
        limit=limit,
        search=search
    )
    
    total_pages = math.ceil(total / limit) if total > 0 else 1
    
    return PaginatedVendors(
        items=vendors,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/{id}", response_model=VendorOut)
def get_vendor(
    id: str,
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    """Get a specific vendor detail by ID."""
    from app.models.vendor import Vendor
    vendor = db.query(Vendor).filter(Vendor.id == id, Vendor.tenant_id == tenant_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor
