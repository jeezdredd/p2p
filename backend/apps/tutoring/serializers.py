from rest_framework import serializers
from .models import TutoringSession, SessionReview
from apps.users.serializers import UserSerializer, SubjectSerializer
from apps.users.models import Subject, User
from django.utils import timezone


class SessionReviewSerializer(serializers.ModelSerializer):
    reviewer_detail = UserSerializer(source='reviewer', read_only=True)
    
    class Meta:
        model = SessionReview
        fields = [
            'id', 'session', 'reviewer', 'reviewer_detail',
            'rating', 'comment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        session = attrs.get('session')
        if session and session.status != 'completed':
            raise serializers.ValidationError(
                'Can only review completed sessions'
            )
        return attrs


class TutoringSessionSerializer(serializers.ModelSerializer):
    tutor_detail = UserSerializer(source='tutor', read_only=True)
    student_detail = UserSerializer(source='student', read_only=True)
    subject_detail = SubjectSerializer(source='subject', read_only=True)
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all())
    review = SessionReviewSerializer(read_only=True)
    cancelled_by_detail = UserSerializer(source='cancelled_by', read_only=True)
    
    # Make tutor and student optional in serializer - they will be set in perform_create
    tutor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='tutor'),
        required=False,
        allow_null=True
    )
    student = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='student'),
        required=False,
        allow_null=True
    )

    class Meta:
        model = TutoringSession
        fields = [
            'id', 'tutor', 'tutor_detail', 'student', 'student_detail',
            'subject', 'subject_detail', 'title', 'date', 'time',
            'duration', 'status', 'notes', 'confirmation_required',
            'is_confirmed', 'confirmed_at', 'cancelled_by', 'cancelled_by_detail',
            'cancellation_reason', 'max_students', 'review',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'confirmed_at']

    def validate(self, attrs):
        request = self.context.get('request')
        user = request.user if request else None
        
        # Only validate date/time on creation, not on partial updates
        if self.instance is None:  # Creation
            if not attrs.get('date'):
                raise serializers.ValidationError({'date': 'Date is required'})
            if not attrs.get('time'):
                raise serializers.ValidationError({'time': 'Time is required'})
            
            # Role-based validation
            if user:
                if user.role == 'tutor':
                    # Tutor can't specify different tutor
                    if 'tutor' in attrs and attrs['tutor'] and attrs['tutor'] != user:
                        raise serializers.ValidationError(
                            {'tutor': 'Tutors can only create sessions for themselves'}
                        )
                else:  # student
                    # Student can't specify different student
                    if 'student' in attrs and attrs['student'] and attrs['student'] != user:
                        raise serializers.ValidationError(
                            {'student': 'Students can only book sessions for themselves'}
                        )
                    # Student must provide tutor (it won't be auto-set)
                    if not attrs.get('tutor'):
                        raise serializers.ValidationError(
                            {'tutor': 'Please select a tutor'}
                        )
            
            # Check if tutor has overlapping sessions
            # Use provided tutor or current user if tutor
            tutor = attrs.get('tutor') or (user if user and user.role == 'tutor' else None)
            date = attrs.get('date')
            time = attrs.get('time')
            
            if date and time and tutor:
                # Check for conflicts
                overlapping = TutoringSession.objects.filter(
                    tutor=tutor,
                    date=date,
                    time=time,
                    status__in=['pending', 'scheduled']
                ).exists()
                
                if overlapping:
                    raise serializers.ValidationError(
                        'Tutor already has a session at this time'
                    )
        else:  # Update
            # Validate status transitions
            if 'status' in attrs:
                new_status = attrs['status']
                old_status = self.instance.status
                
                # Prevent invalid status transitions
                if old_status == 'cancelled':
                    raise serializers.ValidationError(
                        'Cannot modify a cancelled session'
                    )
                if old_status == 'completed' and new_status != 'completed':
                    raise serializers.ValidationError(
                        'Cannot change status of a completed session'
                    )
        
        return attrs
