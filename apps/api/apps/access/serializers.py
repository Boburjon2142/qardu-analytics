from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.organization.models import OrganizationUnit

from .models import Role, RoleAssignment, SupervisionScope

_GRANT_FIELDS = [
    "id",
    "user_id",
    "unit_id",
    "valid_from",
    "valid_to",
    "assigned_by_id",
    "created_at",
]


class RoleAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoleAssignment
        fields = [*_GRANT_FIELDS, "role"]
        read_only_fields = fields


class SupervisionScopeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupervisionScope
        fields = _GRANT_FIELDS
        read_only_fields = fields


class _GrantInput(serializers.Serializer):
    # Only active users can receive grants; inactive ids look the same as unknown ones.
    user_id = serializers.PrimaryKeyRelatedField(
        source="user", queryset=get_user_model().objects.filter(is_active=True)
    )
    valid_from = serializers.DateField(required=False)
    valid_to = serializers.DateField(required=False, allow_null=True)


class RoleAssignmentInput(_GrantInput):
    role = serializers.ChoiceField(choices=Role.choices)
    unit_id = serializers.PrimaryKeyRelatedField(
        source="unit", queryset=OrganizationUnit.objects.all(), required=False, allow_null=True
    )


class SupervisionScopeInput(_GrantInput):
    unit_id = serializers.PrimaryKeyRelatedField(
        source="unit", queryset=OrganizationUnit.objects.all()
    )


class RevokeInput(serializers.Serializer):
    valid_to = serializers.DateField(required=False)
