import re
import uuid

_VALID_ID = re.compile(r"^[A-Za-z0-9._-]{8,64}$")


class RequestIDMiddleware:
    """Attach a request id (accept a sane client value, else generate) and echo it back."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        rid = request.headers.get("X-Request-ID", "")
        if not _VALID_ID.match(rid):
            rid = uuid.uuid4().hex
        request.request_id = rid
        response = self.get_response(request)
        response["X-Request-ID"] = rid
        return response
