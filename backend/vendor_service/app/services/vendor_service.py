from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.vendor import Vendor
from app.models.vendor_registration import VendorRegistration, RegistrationStatus

class VendorService:
    @staticmethod
    def get_vendor_by_registration(db: Session, registration_id: str, tenant_id: str) -> Vendor:
        return db.query(Vendor).filter(
            Vendor.registration_id == registration_id,
            Vendor.tenant_id == tenant_id
        ).first()

    @staticmethod
    def get_vendors(
        db: Session,
        tenant_id: str,
        skip: int = 0,
        limit: int = 10,
        search: str = None
    ):
        query = db.query(Vendor).filter(Vendor.tenant_id == tenant_id)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(Vendor.business_name.ilike(search_term))
            
        total = query.count()
        vendors = query.order_by(Vendor.created_at.desc()).offset(skip).limit(limit).all()
        
        return vendors, total

    @staticmethod
    def convert_to_vendor(db: Session, registration_id: str, tenant_id: str) -> Vendor:
        # Get registration
        registration = db.query(VendorRegistration).filter(
            VendorRegistration.id == registration_id,
            VendorRegistration.tenant_id == tenant_id
        ).first()

        if not registration:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor registration not found")

        if registration.status != RegistrationStatus.APPROVED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Cannot convert registration with status {registration.status}. Must be APPROVED."
            )

        # Check if already converted
        existing_vendor = VendorService.get_vendor_by_registration(db, registration_id, tenant_id)
        if existing_vendor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This registration has already been converted to a vendor."
            )

        # Create new vendor
        vendor = Vendor(
            tenant_id=tenant_id,
            registration_id=registration.id,
            business_name=registration.business_name,
            contact_person=registration.contact_person,
            contact_person_email=registration.contact_person_email,
            email=registration.email,
            phone=registration.phone,
            address_line1=registration.address_line1,
            address_line2=registration.address_line2,
            city=registration.city,
            state=registration.state,
            postal_code=registration.postal_code,
            country=registration.country,
            gst_number=registration.gst_number,
            pan_number=registration.pan_number,
            business_type=registration.business_type,
            products_services=registration.products_services,
            status="ACTIVE"
        )
        db.add(vendor)

        # Update registration status
        registration.status = RegistrationStatus.CONVERTED
        db.commit()
        db.refresh(vendor)

        return vendor
