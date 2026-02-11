# Pre-registration Enhancement Walkthrough

This document details the changes made to enhance the vendor pre-registration flow, including validation, email notifications, and a management interface.

## 1. Feature Overview

- **Frontend Validation**: The pre-registration form now validates required fields before allowing submission.
- **Email Notification**: The user who created the invitation receives an email notification when a vendor completes the pre-registration.
- **Management Page**: A new page `/pre-registrations` allows internal users to view all submitted pre-registrations.
- **Backend Enhancements**: updated data models to track invitation creators and new endpoints for fetching registration data.

## 2. Technical Implementation

### Backend (Vendor Service)

- **Database Model**: Updated `Invitation` model to include `created_by_email`.
  - **Migration Note**: If the `invitations` table already exists, you need to add the following columns:
    ```sql
    ALTER TABLE invitations ADD COLUMN IF NOT EXISTS created_by UUID;
    ALTER TABLE invitations DROP COLUMN IF EXISTS created_by_email;
    ```
- **API Endpoints**:
  - `POST /api/v1/invitations`: Now captures the creator's email from the authenticated user context.
  - `GET /api/v1/pre-registrations`: New protected endpoint to list pre-registrations with pagination and search.
- **Services**:
  - `EmailService`: Added `send_pre_registration_notification` using Resend.
  - `PreRegistrationService`: Triggers notification email upon successful submission.
  - `InvitationService`: Handles storing of `created_by_email`.

### Frontend

- **PreConstructionPage**:
  - Implemented step-wise validation logic (`isStepValid`).
  - Disabled "Next" and "Submit" buttons when fields are invalid.
- **PreRegistrationsPage**:
  - Created new page to list vendor pre-registrations.
  - Implemented data table with pagination and search.
- **Routing**:
  - Added `/pre-registrations` route to `App.tsx`.
- **API**:
  - Added `preRegistrationsAPI` client for fetching data.

## 3. Configuration

- **Environment Variables**:
  - `RESEND_API_KEY`: Required for sending emails (must be set in `.env`).
  - `RESEND_FROM_EMAIL`: Sender address.

## 4. Testing

1. **Invitation Creation**:
   - Log in as an admin/user.
   - Send an invitation.
   - Verify `created_by_email` is stored in the database.

2. **Vendor Registration**:
   - Open the invitation link (public).
   - Try detecting validation errors (empty fields).
   - Submit a valid form.
   - **Result**: The inviter should receive an email about the new registration.

3. **Management View**:
   - Log in as an admin/user.
   - Navigate to `/pre-registrations`.
   - **Result**: The new registration should appear in the table.
