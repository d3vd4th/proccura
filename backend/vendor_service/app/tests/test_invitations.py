import pytest
from unittest.mock import MagicMock
from app.services.invitation_service import InvitationService
from app.schemas.invitation import InvitationCreate
from app.models.invitation import Invitation
import uuid

def test_create_invitation():
    # Arrange
    db = MagicMock()
    tenant_id = str(uuid.uuid4())
    user_id = str(uuid.uuid4())
    
    invitation_payload = InvitationCreate(
        business_name="Test Corp",
        email="test@example.com"
    )

    # Act
    # Note: Using mock DB so actual DB interaction is skipped but logic is verified
    result = InvitationService.create_invitation(
        db=db,
        invitation_in=invitation_payload,
        tenant_id=tenant_id,
        created_by=user_id
    )

    # Assert
    assert result.business_name == "Test Corp"
    # Although result might be the object passed to db.add (if service returns it immediately), mocked session behavior might differ slightly
    # But db.add is called with the object, so checking call args is key.
    
    db.add.assert_called_once()
    db.commit.assert_called_once()
    
    # Check what was added
    added_invitation = db.add.call_args[0][0]
    assert isinstance(added_invitation, Invitation)
    assert added_invitation.business_name == "Test Corp"
    assert added_invitation.email == "test@example.com"
    assert str(added_invitation.created_by) == user_id
    assert added_invitation.tenant_id == tenant_id
