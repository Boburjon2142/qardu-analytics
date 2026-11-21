import time

from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.services import record

from .middleware import SESSION_STARTED_KEY
from .serializers import LoginSerializer, user_payload
from .throttles import LoginAccountThrottle, LoginIpThrottle, email_digest


class CsrfView(APIView):
    """Sets the CSRF cookie for the SPA. Carries no data."""

    authentication_classes = []
    permission_classes = [AllowAny]

    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        return Response({"detail": "ok"})


@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [LoginIpThrottle, LoginAccountThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = authenticate(request, email=email, password=serializer.validated_data["password"])
        if user is None:
            # Same response for unknown email, wrong password and inactive account.
            # Only a digest of the attempted email is stored (no raw identifier, no password).
            record(
                request,
                action="auth.login",
                outcome="failure",
                object_type="login_attempt",
                object_id=email_digest(email),
            )
            return Response(
                {"detail": "Invalid credentials.", "code": "invalid_credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        login(request, user)  # rotates the session key (fixation protection)
        request.session[SESSION_STARTED_KEY] = time.time()
        record(request, action="auth.login", outcome="success", actor=user)
        return Response(user_payload(user))


class LogoutView(APIView):
    authentication_classes = [SessionAuthentication]  # enforces CSRF
    permission_classes = [IsAuthenticated]

    def post(self, request):
        record(request, action="auth.logout", outcome="success", actor=request.user)
        logout(request)
        return Response({"detail": "ok"})


class MeView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(user_payload(request.user))
