from django.urls import path
from .views import (
    SessionListCreateView,
    SessionDetailView,
    UpcomingSessionsView,
    CompletedSessionsView,
    MySessionsView,
)

urlpatterns = [
    path('', SessionListCreateView.as_view(), name='session-list'),
    path('upcoming/', UpcomingSessionsView.as_view(), name='session-upcoming'),
    path('completed/', CompletedSessionsView.as_view(), name='session-completed'),
    path('my/', MySessionsView.as_view(), name='session-my'),
    path('<int:pk>/', SessionDetailView.as_view(), name='session-detail'),
]
