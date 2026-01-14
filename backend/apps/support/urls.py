from django.urls import path
from .views import SupportQueryCreateView

urlpatterns = [
    path('', SupportQueryCreateView.as_view(), name='support-create'),
]
