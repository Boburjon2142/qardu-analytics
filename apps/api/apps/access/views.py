"""ADMIN-zone API for role assignments and supervision scopes (technical administrators only).

Grants are never edited or deleted: create one, or revoke it (which ends it). Every decision goes
through `apps.policy`; denied write attempts are audited.
"""

from datetime import date

from django.core.exceptions import ValidationError as DjangoValidationError
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import SAFE_METHODS, BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView

from apps import policy
from apps.audit.services import record
from apps.organization.services import as_of_q

from . import services
from .models import RoleAssignment, SupervisionScope
from .serializers import (
    RevokeInput,
    RoleAssignmentInput,
    RoleAssignmentSerializer,
    SupervisionScopeInput,
    SupervisionScopeSerializer,
)


class CanManageAccess(BasePermission):
    def has_permission(self, request, view):
        if policy.can(request.user, "access.manage"):
            return True
        if request.user.is_authenticated and request.method not in SAFE_METHODS:
            record(
                request,
                action="access.manage",
                outcome="denied",
                actor=request.user,
                object_type=getattr(view, "audit_object_type", ""),
            )
        return False


def _service_call(fn, **kwargs):
    try:
        return fn(**kwargs)
    except DjangoValidationError as exc:
        raise ValidationError({"detail": exc.messages}) from exc


def _filter_grants(request, qs):
    params = request.query_params
    if "user" in params:
        try:
            qs = qs.filter(user_id=int(params["user"]))
        except ValueError as exc:
            raise ValidationError({"user": "Must be an integer id."}) from exc
    if "active_on" in params:
        try:
            on = date.fromisoformat(params["active_on"])
        except ValueError as exc:
            raise ValidationError({"active_on": "Use the format YYYY-MM-DD."}) from exc
        qs = qs.filter(as_of_q(on))
    return qs.order_by("user_id", "valid_from", "id")


class RoleAssignmentListCreateView(generics.ListAPIView):
    permission_classes = [CanManageAccess]
    serializer_class = RoleAssignmentSerializer
    audit_object_type = "role_assignment"

    def get_queryset(self):
        return _filter_grants(self.request, RoleAssignment.objects.all())

    def post(self, request):
        data = RoleAssignmentInput(data=request.data)
        data.is_valid(raise_exception=True)
        assignment = _service_call(
            services.assign_role, actor=request.user, request=request, **data.validated_data
        )
        return Response(RoleAssignmentSerializer(assignment).data, status=status.HTTP_201_CREATED)


class RoleAssignmentRevokeView(APIView):
    permission_classes = [CanManageAccess]
    audit_object_type = "role_assignment"

    def post(self, request, pk):
        assignment = get_object_or_404(RoleAssignment, pk=pk)
        data = RevokeInput(data=request.data)
        data.is_valid(raise_exception=True)
        assignment = _service_call(
            services.revoke_role,
            assignment=assignment,
            actor=request.user,
            request=request,
            **data.validated_data,
        )
        return Response(RoleAssignmentSerializer(assignment).data)


class SupervisionScopeListCreateView(generics.ListAPIView):
    permission_classes = [CanManageAccess]
    serializer_class = SupervisionScopeSerializer
    audit_object_type = "supervision_scope"

    def get_queryset(self):
        return _filter_grants(self.request, SupervisionScope.objects.all())

    def post(self, request):
        data = SupervisionScopeInput(data=request.data)
        data.is_valid(raise_exception=True)
        scope = _service_call(
            services.assign_supervision, actor=request.user, request=request, **data.validated_data
        )
        return Response(SupervisionScopeSerializer(scope).data, status=status.HTTP_201_CREATED)


class SupervisionScopeRevokeView(APIView):
    permission_classes = [CanManageAccess]
    audit_object_type = "supervision_scope"

    def post(self, request, pk):
        scope = get_object_or_404(SupervisionScope, pk=pk)
        data = RevokeInput(data=request.data)
        data.is_valid(raise_exception=True)
        scope = _service_call(
            services.revoke_supervision,
            scope=scope,
            actor=request.user,
            request=request,
            **data.validated_data,
        )
        return Response(SupervisionScopeSerializer(scope).data)


class MyAccessView(APIView):
    """The caller's own grants valid today (any authenticated user, only their own)."""

    def get(self, request):
        roles = sorted(policy.active_roles(request.user), key=lambda r: (r[0], r[1] or 0))
        return Response(
            {
                "roles": [{"role": role, "unit_id": unit_id} for role, unit_id in roles],
                "supervised_unit_ids": sorted(policy.supervised_unit_ids(request.user)),
            }
        )
