"""
RBAC — Role-Based Access Control decorators and utilities.
Works with Firebase custom claims (role, departmentId).
"""
import logging
from functools import wraps
from typing import List, Optional

from fastapi import HTTPException, Request

logger = logging.getLogger(__name__)

# ── Canonical role hierarchy ──────────────────────────────────
ROLES = ("bidder", "officer", "senior_officer", "admin")

ROLE_HIERARCHY = {role: idx for idx, role in enumerate(ROLES)}

# ── Resource → allowed roles mapping ─────────────────────────
RESOURCE_PERMISSIONS = {
    # Officer-side resources
    "tenders:create":        ["officer", "senior_officer", "admin"],
    "tenders:read":          ["officer", "senior_officer", "admin", "bidder"],
    "tenders:update":        ["officer", "senior_officer", "admin"],
    "tenders:delete":        ["senior_officer", "admin"],
    "documents:create":      ["officer", "senior_officer", "admin", "bidder"],
    "documents:read":        ["officer", "senior_officer", "admin", "bidder"],
    "documents:delete":      ["senior_officer", "admin"],
    "evaluation:read":       ["officer", "senior_officer", "admin"],
    "evaluation:execute":    ["officer", "senior_officer", "admin"],
    "review:read":           ["officer", "senior_officer", "admin"],
    "review:update":         ["officer", "senior_officer", "admin"],
    "review:signoff":        ["senior_officer", "admin"],
    "credibility:read":      ["officer", "senior_officer", "admin"],
    "credibility:execute":   ["officer", "senior_officer", "admin"],
    "notification:read":     ["officer", "senior_officer", "admin", "bidder"],
    "notification:execute":  ["officer", "senior_officer", "admin"],
    "export:execute":        ["officer", "senior_officer", "admin"],
    "dashboard:read":        ["officer", "senior_officer", "admin"],
    "audit:read":            ["admin"],
    "users:read":            ["senior_officer", "admin"],
    "users:manage":          ["admin"],
    # Bidder-side resources
    "submissions:create":    ["bidder"],
    "submissions:read":      ["bidder", "officer", "senior_officer", "admin"],
    "submissions:update":    ["bidder"],
    "verdicts:read":         ["bidder", "officer", "senior_officer", "admin"],
    "profile:read":          ["bidder", "officer", "senior_officer", "admin"],
    "profile:update":        ["bidder"],
    "bidder_notifications:read": ["bidder"],
}


def _get_role(request: Request) -> str:
    """Extract role from request.state (set by AuthMiddleware)."""
    return getattr(request.state, "role", "bidder")


def _get_user_id(request: Request) -> str:
    return getattr(request.state, "user_id", "")


def require_role(*allowed_roles: str):
    """FastAPI dependency that raises 403 if the caller's role is not in allowed_roles."""
    def dependency(request: Request):
        role = _get_role(request)
        if role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Role '{role}' is not authorised. Required: {allowed_roles}",
            )
        return role
    return dependency


def require_permission(resource_action: str):
    """FastAPI dependency checking against RESOURCE_PERMISSIONS map."""
    def dependency(request: Request):
        role = _get_role(request)
        allowed = RESOURCE_PERMISSIONS.get(resource_action, [])
        if role not in allowed:
            raise HTTPException(
                status_code=403,
                detail=f"Permission denied for '{resource_action}'. Role '{role}' not in {allowed}",
            )
        return role
    return dependency


def is_officer_role(role: str) -> bool:
    """Return True when the role belongs to the officer side."""
    return role in ("officer", "senior_officer", "admin")


def is_bidder_role(role: str) -> bool:
    return role == "bidder"


def role_at_least(role: str, minimum: str) -> bool:
    """Return True when *role* is equal to or above *minimum* in the hierarchy."""
    return ROLE_HIERARCHY.get(role, -1) >= ROLE_HIERARCHY.get(minimum, 999)
