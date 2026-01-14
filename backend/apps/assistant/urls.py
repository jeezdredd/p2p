from django.urls import path
from .views import AssistantChatAPIView

urlpatterns = [
    path("assistant/chat", AssistantChatAPIView.as_view()),
]
