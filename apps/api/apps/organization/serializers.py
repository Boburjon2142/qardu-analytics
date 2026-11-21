from rest_framework import serializers

from .models import OrganizationUnitVersion


class UnitVersionSerializer(serializers.ModelSerializer):
    """Public shape of a unit state. Exposes identity and structure only."""

    id = serializers.IntegerField(source="unit_id", read_only=True)
    code = serializers.CharField(source="unit.code", read_only=True)
    parent_id = serializers.IntegerField(source="parent_unit_id", read_only=True, allow_null=True)

    class Meta:
        model = OrganizationUnitVersion
        fields = ["id", "code", "name", "unit_type", "parent_id", "valid_from", "valid_to"]
        read_only_fields = fields
