from django.urls import path
from .views import (
    SessionListCreateView,
    SessionDetailView,
    UpcomingSessionsView,
    CompletedSessionsView,
    MySessionsView,
    SessionConfirmView,
    SessionCancelView,
    SessionReviewListCreateView,
    SessionReviewDetailView,
)

urlpatterns = [
    path('', SessionListCreateView.as_view(), name='session-list'),
    path('upcoming/', UpcomingSessionsView.as_view(), name='session-upcoming'),
    path('completed/', CompletedSessionsView.as_view(), name='session-completed'),
    path('my/', MySessionsView.as_view(), name='session-my'),
    path('<int:pk>/', SessionDetailView.as_view(), name='session-detail'),
    path('<int:pk>/confirm/', SessionConfirmView.as_view(), name='session-confirm'),
    path('<int:pk>/cancel/', SessionCancelView.as_view(), name='session-cancel'),
    path('reviews/', SessionReviewListCreateView.as_view(), name='review-list'),
    path('reviews/<int:pk>/', SessionReviewDetailView.as_view(), name='review-detail'),
]
