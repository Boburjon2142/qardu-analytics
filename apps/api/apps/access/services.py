"""Validated writes for role assignments and supervision scopes (milestone 2.3).

The database is the last line of defence (range/role CHECKs, overlap exclusion, history trigger,
no self-assignment); these services turn the same rules into clear validation errors and audit
every grant and revocation.
"""

from datetime import date

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.utils import timezone

from apps.audit.services import record
from apps.organization.models import UnitType
from apps.organization.services import versions_as_of

from .models import UNIT_ROLES, Role, RoleAssignment, SupervisionScope

# Which unit types a unit-bound role may be attached to. Proposed (B3/B4 Unresolved).
ROLE_UNIT_TYPES = {
    Role.DEAN: {UnitType.FACULTY},
    Role.UNIT_HEAD: {UnitType.DEPARTMENT, UnitType.OFFICE, UnitType.CENTER},
    Role.APPROVER: set(UnitType.values),
}


def _check_common(*, user, actor, valid_from, valid_to, backdate_allowed):
    if actor is not None and actor.pk == user.pk:
        raise ValidationError("You cannot grant access to yourself.")
    if not user.is_active:
        raise ValidationError("The user is deactivated.")
    if valid_to is not None and valid_to < valid_from:
        raise ValidationError("valid_to must not be before valid_from.")
    if not backdate_allowed and valid_from < timezone.localdate():
        raise ValidationError("valid_from cannot be in the past.")


def _unit_type_on(unit, on: date):
    version = versions_as_of(on).filter(unit=unit).first()
    if version is None:
        raise ValidationError("The unit does not exist on valid_from.")
    return version.unit_type


@transaction.atomic
def assign_role(
    *,
    user,
    role,
    unit=None,
    valid_from=None,
    valid_to=None,
    actor=None,
    request=None,
    backdate_allowed=False,
):
    """Grant `role` to `user`. Only bootstrap (command line, `actor=None`) may backdate."""
    valid_from = valid_from or timezone.localdate()
    if role not in Role.values:
        raise ValidationError("Unknown role.")
    _check_common(
        user=user,
        actor=actor,
        valid_from=valid_from,
        valid_to=valid_to,
        backdate_allowed=backdate_allowed,
    )
    if role in UNIT_ROLES:
        if unit is None:
            raise ValidationError(f"The role {role} requires a unit.")
        if _unit_type_on(unit, valid_from) not in ROLE_UNIT_TYPES[role]:
            raise ValidationError(f"The role {role} cannot be attached to this type of unit.")
    elif unit is not None:
        raise ValidationError(f"The role {role} must not have a unit.")
    try:
        with transaction.atomic():
            assignment = RoleAssignment.objects.create(
                user=user,
                role=role,
                unit=unit,
                valid_from=valid_from,
                valid_to=valid_to,
                assigned_by=actor,
            )
    except IntegrityError as exc:
        raise ValidationError(
            "The user already holds this role for an overlapping period."
        ) from exc
    record(
        request,
        action="access.role.assign",
        outcome="success",
        actor=actor,
        object_type="role_assignment",
        object_id=str(assignment.pk),
    )
    return assignment


@transaction.atomic
def assign_supervision(
    *, user, unit, valid_from=None, valid_to=None, actor=None, request=None, backdate_allowed=False
):
    """Add a unit to a vice-rector's supervision scope."""
    valid_from = valid_from or timezone.localdate()
    _check_common(
        user=user,
        actor=actor,
        valid_from=valid_from,
        valid_to=valid_to,
        backdate_allowed=backdate_allowed,
    )
    _unit_type_on(unit, valid_from)  # the unit must exist on the start date
    try:
        with transaction.atomic():
            scope = SupervisionScope.objects.create(
                user=user, unit=unit, valid_from=valid_from, valid_to=valid_to, assigned_by=actor
            )
    except IntegrityError as exc:
        raise ValidationError(
            "This unit is already supervised by the user in that period."
        ) from exc
    record(
        request,
        action="access.scope.assign",
        outcome="success",
        actor=actor,
        object_type="supervision_scope",
        object_id=str(scope.pk),
    )
    return scope


def _revoke(model, obj, *, valid_to, actor, request, action, object_type):
    obj = model.objects.select_for_update().get(pk=obj.pk)
    today = timezone.localdate()
    end = valid_to or today
    if end < today:
        raise ValidationError("Access cannot be revoked retroactively.")
    # A grant that has not started yet is cancelled (empty range), never shifted.
    end = max(end, obj.valid_from)
    if obj.valid_to is not None and end >= obj.valid_to:
        raise ValidationError("This grant already ends on or before that date.")
    obj.valid_to = end
    obj.save(update_fields=["valid_to"])
    record(
        request,
        action=action,
        outcome="success",
        actor=actor,
        object_type=object_type,
        object_id=str(obj.pk),
    )
    return obj


@transaction.atomic
def revoke_role(assignment, *, valid_to=None, actor=None, request=None):
    """End a role assignment on `valid_to` (default today). Only shortens, never extends."""
    return _revoke(
        RoleAssignment,
        assignment,
        valid_to=valid_to,
        actor=actor,
        request=request,
        action="access.role.revoke",
        object_type="role_assignment",
    )


@transaction.atomic
def revoke_supervision(scope, *, valid_to=None, actor=None, request=None):
    return _revoke(
        SupervisionScope,
        scope,
        valid_to=valid_to,
        actor=actor,
        request=request,
        action="access.scope.revoke",
        object_type="supervision_scope",
    )
