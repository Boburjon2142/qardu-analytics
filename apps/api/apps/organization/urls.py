from django.urls import path

from . import views

urlpatterns = [
    path("units/", views.UnitListView.as_view(), name="org-unit-list"),
    path("units/<int:pk>/", views.UnitDetailView.as_view(), name="org-unit-detail"),
    path("units/<int:pk>/history/", views.UnitHistoryView.as_view(), name="org-unit-history"),
]
