import time

from django.conf import settings
from django.contrib.auth import logout

SESSION_STARTED_KEY = "session_started_at"


class AbsoluteSessionTimeoutMiddleware:
    """Reject sessions older than SESSION_ABSOLUTE_AGE regardless of activity."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            started = request.session.get(SESSION_STARTED_KEY)
            if not isinstance(started, (int, float)) or (
                time.time() - started > settings.SESSION_ABSOLUTE_AGE
            ):
                logout(request)
        return self.get_response(request)
