from rest_framework import serializers
from .models import Discussion, Reply
from apps.users.serializers import UserSerializer, SubjectSerializer
from apps.users.models import Subject


class ReplySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    children = serializers.SerializerMethodField()

    class Meta:
        model = Reply
        fields = ['id', 'discussion', 'author', 'parent', 'content', 'children', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'discussion', 'created_at', 'updated_at']

    def get_children(self, obj):
        children = obj.children.all()
        return ReplySerializer(children, many=True).data

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class DiscussionListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    subject_detail = SubjectSerializer(source='subject', read_only=True)
    reply_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Discussion
        fields = ['id', 'author', 'subject', 'subject_detail', 'title', 'reply_count', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']


class DiscussionDetailSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    subject_detail = SubjectSerializer(source='subject', read_only=True)
    subject = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        required=False,
        allow_null=True
    )
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Discussion
        fields = [
            'id', 'author', 'subject', 'subject_detail', 'title',
            'content', 'replies', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def get_replies(self, obj):
        top_level_replies = obj.replies.filter(parent=None)
        return ReplySerializer(top_level_replies, many=True).data

    def validate(self, attrs):
        if not attrs.get('title'):
            raise serializers.ValidationError({'title': 'Title is required'})
        if not attrs.get('content'):
            raise serializers.ValidationError({'content': 'Content is required'})
        return attrs

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
