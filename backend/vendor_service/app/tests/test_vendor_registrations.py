import pytest
from unittest.mock import MagicMock, patch
from app.services.vendor_registration_service import VendorRegistrationService
from app.schemas.invitation import VendorRegistrationCreate
from app.models.invitation import Invitation
from app.models.vendor_registration import VendorRegistration
import uuid

def test_submit_registration_success():
    # Arrange
    db = MagicMock()
    token = "valid_token"
    invitation_id = uuid.uuid4()
    tenant_id = str(uuid.uuid4())
    
    # Mock invitation returned by verify_invitation_token
    mock_invitation = Invitation(
        id=invitation_id,
        tenant_id=tenant_id,
        status="PENDING"
    )
    
    registration_data = VendorRegistrationCreate(
        business_name="Vendor Corp",
        contact_person="John Doe",
        email="vendor@example.com",
        phone="1234567890",
        address_line1="123 Street",
        city="City",
        state="State",
        postal_code="12345",
        country="Country"
    )

    # Mock DB query for existing registration returning None
    db.query.return_value.filter.return_value.first.return_value = None

    # Patch InvitationService.verify_invitation_token
    with patch("app.services.invitation_service.InvitationService.verify_invitation_token") as mock_verify:
        mock_verify.return_value = mock_invitation
        
        # Act
        result = VendorRegistrationService.submit_registration(
            db=db,
            token=token,
            registration_data=registration_data
        )

        # Assert
        assert result.business_name == "Vendor Corp"
        assert result.invitation_id == invitation_id
        assert mock_invitation.status == "REGISTERED"
        
        db.add.assert_called_once()
        db.commit.assert_called_once()

def test_submit_registration_already_exists():
    # Arrange
    db = MagicMock()
    token = "valid_token"
    invitation_id = uuid.uuid4()
    
    mock_invitation = Invitation(id=invitation_id, status="PENDING")
    
    registration_data = VendorRegistrationCreate(
        business_name="Vendor Corp",
        contact_person="John Doe",
        email="vendor@example.com",
        phone="1234567890",
        address_line1="123 Street",
        city="City",
        state="State",
        postal_code="12345",
        country="Country"
    )

    # Mock DB query returning an existing registration
    db.query.return_value.filter.return_value.first.return_value = MagicMock()

    with patch("app.services.invitation_service.InvitationService.verify_invitation_token") as mock_verify:
        mock_verify.return_value = mock_invitation
        
        # Act & Assert
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as excinfo:
            VendorRegistrationService.submit_registration(
                db=db,
                token=token,
                registration_data=registration_data
            )
        assert excinfo.value.status_code == 400
        assert "already been submitted" in excinfo.value.detail

def test_get_registrations():
    # Arrange
    db = MagicMock()
    tenant_id = "tenant_1"
    
    # Mock query chain
    mock_query = db.query.return_value
    mock_filter = mock_query.filter.return_value
    
    # Mock count
    mock_filter.count.return_value = 5
    
    # Mock pagination
    mock_offset = mock_filter.order_by.return_value.offset.return_value
    mock_limit = mock_offset.limit.return_value
    mock_limit.all.return_value = [MagicMock(), MagicMock()] # Return 2 items

    # Act
    result = VendorRegistrationService.get_registrations(
        db=db,
        tenant_id=tenant_id,
        page=1,
        limit=10
    )

    # Assert
    assert result["total"] == 5
    assert len(result["items"]) == 2
    assert result["page"] == 1
