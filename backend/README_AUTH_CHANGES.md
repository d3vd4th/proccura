# Authorization System Updates

This document summarizes the changes made to the authorization flow to simplify tenant access validation.

## Changes Overview

1. **Auth Service**:
   - Access Tokens now include `tenant_id` and `role_id` in their payload after login.
   - Refresh Tokens also carry tenant context to maintain session consistency.
   - The token generation logic (`issue_tokens`, `create_access_token`) was updated to include these claims.

2. **API Gateway**:
   - Removed the external call to `get_tenant_access`.
   - `require_auth` middleware now extracts `tenant_id` and `role_id` directly from the JWT claims.
   - It validates that the token's tenant matches the request context (if applicable).
   - User context (ID, Role, Tenant) is injected into request headers for downstream services.

## Why this change?

To improve performance and reliability by avoiding a synchronous HTTP call from the API Gateway to the Auth Service on every request. The JWT acts as a self-contained proof of authorization.

## Verification

After applying these changes:
1. **Logout**: Clear any existing tokens.
2. **Login**: Authenticate again to receive a new JWT with updated claims.
3. **Verify**: Check that protected routes (e.g., `/api/v1/invitations`) work without errors.
