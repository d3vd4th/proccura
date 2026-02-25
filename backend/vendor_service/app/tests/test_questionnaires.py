import pytest
from unittest.mock import MagicMock
from app.services.questionnaire_service import QuestionnaireService
from app.schemas.questionnaire import QuestionnaireCreate
from app.models.questionnaire import Questionnaire
import uuid

def test_create_questionnaire():
    # Arrange
    db = MagicMock()
    tenant_id = str(uuid.uuid4())
    
    questionnaire_payload = QuestionnaireCreate(
        domain="Security",
        type="yes_no",
        question="Do you have SOC2 compliance?",
        expected_response="Yes",
        attachment_required=True
    )

    # Act
    result = QuestionnaireService.create_questionnaire(
        db=db,
        questionnaire_in=questionnaire_payload,
        tenant_id=tenant_id
    )

    # Assert
    assert result.domain == "Security"
    
    db.add.assert_called_once()
    db.commit.assert_called_once()
    
    # Check what was added
    added_questionnaire = db.add.call_args[0][0]
    assert isinstance(added_questionnaire, Questionnaire)
    assert added_questionnaire.domain == "Security"
    assert added_questionnaire.type == "yes_no"
    assert added_questionnaire.question == "Do you have SOC2 compliance?"
    assert added_questionnaire.expected_response == "Yes"
    assert added_questionnaire.attachment_required is True
    assert added_questionnaire.tenant_id == tenant_id
