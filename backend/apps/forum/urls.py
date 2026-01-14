from django.urls import path
from .views import DiscussionListCreateView, DiscussionDetailView, ReplyCreateView

urlpatterns = [
    path('', DiscussionListCreateView.as_view(), name='discussion-list'),
    path('<int:pk>/', DiscussionDetailView.as_view(), name='discussion-detail'),
    path('<int:discussion_id>/replies/', ReplyCreateView.as_view(), name='reply-create'),
]
