from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import StudyMaterial
from .serializers import StudyMaterialSerializer


class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user


class MaterialListCreateView(generics.ListCreateAPIView):
    queryset = StudyMaterial.objects.select_related('author', 'subject')
    serializer_class = StudyMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['subject', 'author']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']


class MaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudyMaterial.objects.select_related('author', 'subject')
    serializer_class = StudyMaterialSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
