# Testing Guide for Vendor Service

This guide explains how to run automated tests for the Vendor Service.

## Prerequisites

Ensure you have the test dependencies installed:

```bash
pip install pytest httpx pytest-asyncio
```

(These are included in `requirements.txt`)

## Running Tests

From the `backend/vendor_service` directory, run:

```bash
pytest
```

## Writing Tests

Tests are located in `app/tests/`.
We use `pytest` for running tests and `unittest.mock` for mocking dependencies like the database.

### Example: Testing Invitation Creation

See `app/tests/test_invitations.py`.
This test verifies that:
1. The `InvitationService.created_by` method is called with correct arguments.
2. The `created_by` field (user ID) is correctly passed to the database model.
3. The database session commits the transaction.

### Adding More Tests

To test other services (e.g., Pre-registration), create a new file `app/tests/test_pre_registration.py` and follow a similar pattern:
1. Mock the DB session.
2. Call the service method.
3. Assert the expected outcome and DB calls.
