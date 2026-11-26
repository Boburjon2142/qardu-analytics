from datetime import date

from django.http import Http404
from django.utils import timezone
from rest_framework import generics
from rest_framework.exceptions import ValidationError

from apps import policy

from .models import OrganizationUnitVersion
from .serializers import UnitVersionSerializer
from .services import versions_as_of


def _as_of(request) -> date:
    raw = request.query_params.get("as_of")
    if not raw:
        return timezone.localdate()
    try:
        return date.fromisoformat(raw)
    except ValueError as exc:
        raise ValidationError({"as_of": "Use the format YYYY-MM-DD."}) from exc


def _visible_versions(request, on: date):
    # Every read goes through the central policy; no role checks live in views.
    return policy.scope_queryset(request.user, versions_as_of(on), on=on)


class UnitListView(generics.ListAPIView):
    """Units visible to the caller, as of a date (default today)."""

    serializer_class = UnitVersionSerializer

    def get_queryset(self):
        return _visible_versions(self.request, _as_of(self.request)).order_by("name", "unit_id")


class UnitDetailView(generics.RetrieveAPIView):
    serializer_class = UnitVersionSerializer

    def get_object(self):
        # Outside the caller's scope the unit is indistinguishable from a missing one (404).
        qs = _visible_versions(self.request, _as_of(self.request))
        obj = qs.filter(unit_id=self.kwargs["pk"]).first()
        if obj is None:
            raise Http404
        return obj


class UnitHistoryView(generics.ListAPIView):
    """All versions of a unit in the caller's scope today, oldest first.

    Breadcrumb ancestors are readable in the tree but their history is not (policy "org.history").
    """

    serializer_class = UnitVersionSerializer

    def get_queryset(self):
        pk = self.kwargs["pk"]
        today = timezone.localdate()
        if not versions_as_of(today).filter(unit_id=pk).exists() or not policy.can(
            self.request.user, "org.history", pk, on=today
        ):
            raise Http404
        return (
            OrganizationUnitVersion.objects.filter(unit_id=pk)
            .select_related("unit")
            .order_by("valid_from")
        )
