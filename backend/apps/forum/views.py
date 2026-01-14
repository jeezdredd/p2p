from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from django.db.models import Count
from .models import Discussion, Reply
from .serializers import DiscussionListSerializer, DiscussionDetailSerializer, ReplySerializer


class DiscussionListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['subject', 'author']
    search_fields = ['title', 'content']

    def get_queryset(self):
        return Discussion.objects.select_related('author', 'subject').annotate(
            reply_count=Count('replies')
        )

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DiscussionDetailSerializer
        return DiscussionListSerializer


class DiscussionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Discussion.objects.select_related('author', 'subject').prefetch_related('replies__author')
    serializer_class = DiscussionDetailSerializer
    permission_classes = [permissions.IsAuthenticated]


class ReplyCreateView(generics.CreateAPIView):
    queryset = Reply.objects.all()
    serializer_class = ReplySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        discussion_id = self.kwargs.get('discussion_id')
        serializer.save(
            author=self.request.user,
            discussion_id=discussion_id
        )
