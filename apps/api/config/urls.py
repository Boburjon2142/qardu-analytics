from django.urls import include, path

urlpatterns = [
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/org/", include("apps.organization.urls")),
    path("api/v1/access/", include("apps.access.urls")),
    path("api/v1/", include("apps.core.urls")),
]
