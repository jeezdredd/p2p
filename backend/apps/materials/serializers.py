from rest_framework import serializers
from .models import StudyMaterial
from apps.users.serializers import UserSerializer, SubjectSerializer


class StudyMaterialSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    subject_detail = SubjectSerializer(source='subject', read_only=True)
    subject = serializers.PrimaryKeyRelatedField(
        queryset=StudyMaterial._meta.get_field('subject').related_model.objects.all(),
        write_only=False
    )

    class Meta:
        model = StudyMaterial
        fields = [
            'id', 'author', 'subject', 'subject_detail', 'title',
            'description', 'file', 'link', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def validate(self, attrs):
        file = attrs.get('file')
        link = attrs.get('link', '').strip()
        
        if not file and not link:
            raise serializers.ValidationError('Either file or link must be provided')
        return attrs

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
