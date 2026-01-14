from rest_framework import serializers
from .models import TutoringSession
from apps.users.serializers import UserSerializer, SubjectSerializer
from apps.users.models import Subject


class TutoringSessionSerializer(serializers.ModelSerializer):
    tutor_detail = UserSerializer(source='tutor', read_only=True)
    student_detail = UserSerializer(source='student', read_only=True)
    subject_detail = SubjectSerializer(source='subject', read_only=True)
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all())

    class Meta:
        model = TutoringSession
        fields = [
            'id', 'tutor', 'tutor_detail', 'student', 'student_detail',
            'subject', 'subject_detail', 'title', 'date', 'time',
            'duration', 'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        if not attrs.get('date'):
            raise serializers.ValidationError({'date': 'Date is required'})
        if not attrs.get('time'):
            raise serializers.ValidationError({'time': 'Time is required'})
        return attrs
