"""Central authorization policy (RBAC + organization scope + object permission + confidentiality).

Milestone 2.3: rules for the Phase 2 resources (organization registry, access management).
No view or serializer may implement its own `if role == ...` checks; they must call into this
module. Anything not explicitly allowed here is denied.

Two dates are involved and kept apart:
- `at`  — when the *grant* must be valid (role/scope validity); always "today" for requests.
- `on`  — the date of the *organization structure* being read (the `as_of` of a query), so a
          dean browsing an older structure sees the units that were under the faculty then.
Both default to today. Results scoping (Phase 3) will add confidentiality on top of this.
"""

from datetime import date

from django.utils import timezone

from apps.access.models import Role, RoleAssignment, SupervisionScope
from apps.organization.models import OrganizationUnitVersion
from apps.organization.services import ancestor_ids, as_of_q, descendant_ids

ALL = None  # sentinel: unrestricted organization scope

# Roles that may read the whole organization structure (Phase 2 matrix). Structure only:
# this grants no access to results or confidential content in later phases.
_WHOLE_TREE_ROLES = frozenset({Role.TECH_ADMIN, Role.RECTOR, Role.ORG_STRUCTURE_APPROVER})


def _is_active_user(user) -> bool:
    return bool(getattr(user, "is_authenticated", False) and getattr(user, "is_active", False))


def active_roles(user, at: date | None = None) -> set[tuple[str, int | None]]:
    """(role, unit_id) pairs valid for `user` on `at`. Empty for anonymous/inactive users."""
    if not _is_active_user(user):
        return set()
    at = at or timezone.localdate()
    return set(RoleAssignment.objects.filter(as_of_q(at), user=user).values_list("role", "unit_id"))


def has_role(user, role: str, at: date | None = None) -> bool:
    return any(r == role for r, _ in active_roles(user, at))


def supervised_unit_ids(user, at: date | None = None) -> set[int]:
    if not _is_active_user(user):
        return set()
    at = at or timezone.localdate()
    return set(
        SupervisionScope.objects.filter(as_of_q(at), user=user).values_list("unit_id", flat=True)
    )


def unit_scope(user, on: date | None = None, at: date | None = None) -> set[int] | None:
    """Units whose own data the user may read (`ALL` = every unit).

    - tech_admin, rector, org_structure_approver: all units (structure only).
    - dean: the faculty and every unit below it (structure as of `on`).
    - vice_rector: exactly the units an administrator assigned (Proposed; no descendants).
    - unit_head, approver: their own unit only.
    - publisher: nothing in Phase 2.
    """
    on = on or timezone.localdate()
    roles = active_roles(user, at)
    if any(role in _WHOLE_TREE_ROLES for role, _ in roles):
        return ALL
    scope: set[int] = set()
    for role, unit_id in roles:
        if role == Role.DEAN:
            scope |= descendant_ids(unit_id, on)
        elif role in (Role.UNIT_HEAD, Role.APPROVER):
            scope.add(unit_id)
        elif role == Role.VICE_RECTOR:
            scope |= supervised_unit_ids(user, at)
    return scope


def readable_unit_ids(user, on: date | None = None, at: date | None = None) -> set[int] | None:
    """Scope plus the ancestor chain of every scoped unit (breadcrumb, P2-3)."""
    on = on or timezone.localdate()
    scope = unit_scope(user, on, at)
    if scope is ALL:
        return ALL
    readable = set(scope)
    for unit_id in scope:
        readable |= ancestor_ids(unit_id, on)
    return readable


def _unit_id(obj) -> int | None:
    if isinstance(obj, int):
        return obj
    return getattr(obj, "unit_id", None) or getattr(obj, "pk", None)


def can(user, action: str, obj=None, at=None, on=None) -> bool:
    """Return True only if the policy explicitly allows `action` (on `obj`)."""
    if not _is_active_user(user):
        return False
    if action == "access.manage":
        return has_role(user, Role.TECH_ADMIN, at)
    if action in ("org.read", "org.history"):
        unit_id = _unit_id(obj)
        if unit_id is None:
            return False
        # Breadcrumb ancestors are readable, but their history is not (only the scope's).
        ids = readable_unit_ids(user, on, at) if action == "org.read" else unit_scope(user, on, at)
        return ids is ALL or unit_id in ids
    return False


def scope_queryset(user, queryset, on=None, at=None):
    """Restrict a queryset to what `user` may see. Unknown models are denied (empty)."""
    if not _is_active_user(user):
        return queryset.none()
    if getattr(queryset, "model", None) is OrganizationUnitVersion:
        ids = readable_unit_ids(user, on, at)
        return queryset if ids is ALL else queryset.filter(unit_id__in=ids)
    return queryset.none()
