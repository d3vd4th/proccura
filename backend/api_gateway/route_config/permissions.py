# Convention-Based Permission Derivation
# Automatically derives permission from route path and HTTP method
# Pattern: resource.action
# Example: GET /api/v1/invitations → invitation.read


def get_required_permission(method: str, path: str) -> str | None:
    """
    Derive permission code from HTTP method and path using convention.
    
    Examples:
        GET /api/v1/invitations → invitation.read
        POST /api/v1/invitations → invitation.create
        PUT /api/v1/invitations/123 → invitation.update
        DELETE /api/v1/vendors/456 → vendor.delete
        GET /api/v1/orders/789/items → order.read
    
    Returns None for paths that don't match the API pattern (public routes).
    """
    # Only apply to API routes
    if not path.startswith("/api/"):
        return None
    
    # Split path: /api/v1/invitations/123 → ["", "api", "v1", "invitations", "123"]
    parts = path.strip("/").split("/")
    
    # Need at least: api/v1/resource
    if len(parts) < 3:
        return None
    
    # Extract resource (e.g., "invitations" from /api/v1/invitations)
    resource = parts[2]  # Third part is the resource
    
    # Singularize resource name (simple approach - remove trailing 's')
    # invitations → invitation, vendors → vendor, orders → order
    if resource.endswith("ies"):
        resource = resource[:-3] + "y"  # categories → category
    elif resource.endswith("s") and not resource.endswith("ss"):
        resource = resource[:-1]  # invitations → invitation
    
    # Map HTTP method to action
    method_to_action = {
        "GET": "read",
        "POST": "create",
        "PUT": "update",
        "PATCH": "update",
        "DELETE": "delete",
    }
    
    action = method_to_action.get(method.upper(), "read")
    
    return f"{resource}.{action}"


# Optional: Override specific routes if convention doesn't apply
ROUTE_OVERRIDES = {
    # ("GET", "/api/v1/some-special-route"): "custom.permission",
}


def get_permission_for_route(method: str, path: str) -> str | None:
    """
    Get permission for route, checking overrides first.
    """
    # Check overrides first
    key = (method.upper(), path)
    if key in ROUTE_OVERRIDES:
        return ROUTE_OVERRIDES[key]
    
    # Fall back to convention-based derivation
    return get_required_permission(method, path)
