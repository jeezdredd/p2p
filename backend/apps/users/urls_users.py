from django.urls import path
from .views import UserListView, UserDetailView, TutorListView

urlpatterns = [
    path('', UserListView.as_view(), name='user-list'),
    path('tutors/', TutorListView.as_view(), name='tutor-list'),
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
]
