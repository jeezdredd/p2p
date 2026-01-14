from rest_framework import generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import models as db_models
from .models import TutoringSession, SessionReview
from .serializers import TutoringSessionSerializer, SessionReviewSerializer


class SessionListCreateView(generics.ListCreateAPIView):
    queryset = TutoringSession.objects.select_related('tutor', 'student', 'subject')
    serializer_class = TutoringSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['subject', 'tutor', 'student', 'status']

    def perform_create(self, serializer):
        user = self.request.user
        
        # If user is a tutor, they create sessions for themselves
        if user.role == 'tutor':
            # Tutor can only be themselves, student is specified in request
            serializer.save(tutor=user)
        else:
            # Student books a session with a tutor
            # Student is always themselves, tutor is specified in request
            serializer.save(student=user)


class SessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TutoringSession.objects.select_related('tutor', 'student', 'subject')
    serializer_class = TutoringSessionSerializer
    permission_classes = [permissions.IsAuthenticated]


class SessionConfirmView(APIView):
    """Endpoint for tutor to confirm a session"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            session = TutoringSession.objects.get(pk=pk)
        except TutoringSession.DoesNotExist:
            return Response(
                {'error': 'Session not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Only tutor can confirm
        if session.tutor != request.user:
            return Response(
                {'error': 'Only the tutor can confirm this session'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if session.status != 'pending':
            return Response(
                {'error': 'Can only confirm pending sessions'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session.is_confirmed = True
        session.confirmed_at = timezone.now()
        session.status = 'scheduled'
        session.save()
        
        serializer = TutoringSessionSerializer(session)
        return Response(serializer.data)


class SessionCancelView(APIView):
    """Endpoint for cancelling a session"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            session = TutoringSession.objects.get(pk=pk)
        except TutoringSession.DoesNotExist:
            return Response(
                {'error': 'Session not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Only tutor or student can cancel
        if session.tutor != request.user and session.student != request.user:
            return Response(
                {'error': 'Only the tutor or student can cancel this session'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if session.status == 'cancelled':
            return Response(
                {'error': 'Session is already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if session.status == 'completed':
            return Response(
                {'error': 'Cannot cancel completed sessions'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session.status = 'cancelled'
        session.cancelled_by = request.user
        session.cancellation_reason = request.data.get('reason', '')
        session.save()
        
        serializer = TutoringSessionSerializer(session)
        return Response(serializer.data)


class UpcomingSessionsView(generics.ListAPIView):
    serializer_class = TutoringSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['subject', 'tutor']

    def get_queryset(self):
        today = timezone.now().date()
        return TutoringSession.objects.filter(
            date__gte=today,
            status__in=['pending', 'scheduled']
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
            db_models.Q(tutor=user) | db_models.Q(student=user)
        ).select_related('tutor', 'student', 'subject').order_by('-date', '-time')


class SessionReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = SessionReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SessionReview.objects.select_related(
            'session', 'reviewer', 'session__tutor'
        ).all()
    
    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)


class SessionReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SessionReview.objects.all()
    serializer_class = SessionReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
