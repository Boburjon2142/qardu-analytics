from .models import AuditEvent


def record(request=None, *, action, outcome, actor=None, object_type="", object_id=""):
    """Append an audit event. `request` supplies request id and client address only."""
    ip = request.META.get("REMOTE_ADDR") if request is not None else None
    request_id = getattr(request, "request_id", "") if request is not None else ""
    return AuditEvent.objects.create(
        actor=actor,
        action=action,
        outcome=outcome,
        object_type=object_type,
        object_id=object_id,
        request_id=request_id,
        ip=ip or None,
    )
