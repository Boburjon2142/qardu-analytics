from django.urls import path

from . import views

urlpatterns = [
    path("me/", views.MyAccessView.as_view(), name="access-me"),
    path(
        "role-assignments/",
        views.RoleAssignmentListCreateView.as_view(),
        name="access-role-list",
    ),
    path(
        "role-assignments/<int:pk>/revoke/",
        views.RoleAssignmentRevokeView.as_view(),
        name="access-role-revoke",
    ),
    path(
        "supervision-scopes/",
        views.SupervisionScopeListCreateView.as_view(),
        name="access-scope-list",
    ),
    path(
        "supervision-scopes/<int:pk>/revoke/",
        views.SupervisionScopeRevokeView.as_view(),
        name="access-scope-revoke",
    ),
]
