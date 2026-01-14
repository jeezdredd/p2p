from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import TutoringSession
from .serializers import TutoringSessionSerializer


class SessionListCreateView(generics.ListCreateAPIView):
    queryset = TutoringSession.objects.select_related('tutor', 'student', 'subject')
    serializer_class = TutoringSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['subject', 'tutor', 'student', 'status']


class SessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TutoringSession.objects.select_related('tutor', 'student', 'subject')
    serializer_class = TutoringSessionSerializer
    permission_classes = [permissions.IsAuthenticated]


class UpcomingSessionsView(generics.ListAPIView):
    serializer_class = TutoringSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['subject', 'tutor']

    def get_queryset(self):
        today = timezone.now().date()
        return TutoringSession.objects.filter(
            date__gte=today,
            status='scheduled'
        ).select_related('tutor', 'student', 'subject')


class CompletedSessionsView(generics.ListAPIView):
    serializer_class = TutoringSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['subject', 'tutor']

    def get_queryset(self):
        return TutoringSession.objects.filter(
            status='completed'
        ).select_related('tutor', 'student', 'subject').order_by('-date')


class MySessionsView(generics.ListAPIView):
    serializer_class = TutoringSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return TutoringSession.objects.filter(
            models.Q(tutor=user) | models.Q(student=user)
        ).select_related('tutor', 'student', 'subject')


from django.db import models as db_models

class MySessionsView(generics.ListAPIView):
    serializer_class = TutoringSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return TutoringSession.objects.filter(
            db_models.Q(tutor=user) | db_models.Q(student=user)
        ).select_related('tutor', 'student', 'subject')
