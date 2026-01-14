from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import SupportQuery
from .serializers import SupportQuerySerializer


class SupportQueryCreateView(generics.CreateAPIView):
    queryset = SupportQuery.objects.all()
    serializer_class = SupportQuerySerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {'message': 'Your query has been submitted successfully'},
            status=status.HTTP_201_CREATED
        )
