from django.urls import path
from .views import RegisterView, MeView, SubjectListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('subjects/', SubjectListView.as_view(), name='subject-list'),
]
