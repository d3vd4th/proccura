import re

# Convention-Based Permission Derivation
# Automatically derives permission from route path and HTTP method
#
# Pattern: resource.action  OR  resource.action_sub_resource
#
# Examples:
#   GET  /api/v1/invitations                          → invitation.read
#   POST /api/v1/invitations                          → invitation.create
#   PUT  /api/v1/invitations/{id}                     → invitation.update
#   DELETE /api/v1/vendors/{id}                       → vendor.delete
#   GET  /api/v1/pre-registrations/{id}/questionnaires            → pre-registration.read_questionnaire
#   POST /api/v1/pre-registrations/{id}/questionnaires/assign     → pre-registration.assign_questionnaire
#   GET  /api/v1/questionnaires/domains               → questionnaire.read_domain


# Regex to detect dynamic path segments (UUIDs or numeric IDs)
_ID_PATTERN = re.compile(
    r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|^\d+$',
    re.IGNORECASE
)


def _is_dynamic_segment(segment: str) -> bool:
    """Check if a path segment is a dynamic ID (UUID or numeric)."""
    return bool(_ID_PATTERN.match(segment))


def _singularize(word: str) -> str:
    """Simple singularization: invitations → invitation, categories → category."""
    if word.endswith("ies"):
        return word[:-3] + "y"
    elif word.endswith("s") and not word.endswith("ss"):
        return word[:-1]
    return word


# Map HTTP method → default action verb
_METHOD_TO_ACTION = {
    "GET": "read",
    "POST": "create",
    "PUT": "update",
    "PATCH": "update",
    "DELETE": "delete",
}


def get_required_permission(method: str, path: str) -> str | None:
    """
    Derive permission code from HTTP method and path using convention.

    Handles nested / sub-resource routes by skipping dynamic ID segments
    and incorporating named sub-resource segments into the permission.

    Returns None for paths that don't match the API pattern (public routes).
    """
    if not path.startswith("/api/"):
        return None

    parts = path.strip("/").split("/")

    # Need at least: api / v1 / resource
    if len(parts) < 3:
        return None

    # Primary resource  (e.g. "pre-registrations")
    resource = _singularize(parts[2].replace("-", "_"))

    # Collect named segments after the primary resource, skipping IDs
    # e.g. /api/v1/pre-registrations/{uuid}/questionnaires/assign
    #   remaining = ["questionnaires", "assign"]
    remaining: list[str] = []
    for segment in parts[3:]:
        if not _is_dynamic_segment(segment):
            remaining.append(segment.replace("-", "_"))

    default_action = _METHOD_TO_ACTION.get(method.upper(), "read")

    if not remaining:
        # Simple route: /api/v1/resource  or  /api/v1/resource/{id}
        return f"{resource}.{default_action}"

    # --- Sub-resource logic ---
    # Last named segment could be an explicit action verb
    # Known action verbs that override the HTTP-method default
    _ACTION_VERBS = {"assign", "approve", "reject", "cancel", "submit", "export", "import", "upload", "download", "activate", "deactivate", "archive", "restore", "sync", "verify", "invite", "revoke", "bulk", "resend"}

    last = remaining[-1]

    if last in _ACTION_VERBS:
        # Explicit action verb found
        # e.g. ["questionnaires", "assign"] → action="assign", sub="questionnaire"
        action = last
        sub_parts = remaining[:-1]
    else:
        # No explicit verb — use HTTP method as the action
        # e.g. ["questionnaires"] → action="read", sub="questionnaire"
        action = default_action
        sub_parts = remaining

    if sub_parts:
        sub_resource = "_".join(_singularize(s) for s in sub_parts)
        return f"{resource}.{action}_{sub_resource}"
    else:
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
