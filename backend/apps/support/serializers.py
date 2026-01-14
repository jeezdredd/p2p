from rest_framework import serializers
from .models import SupportQuery


class SupportQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportQuery
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at', 'resolved']
        read_only_fields = ['id', 'created_at', 'resolved']

    def validate_email(self, value):
        if not value or '@' not in value:
            raise serializers.ValidationError('Valid email is required')
        return value
