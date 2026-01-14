from django.urls import path
from .views import MaterialListCreateView, MaterialDetailView

urlpatterns = [
    path('', MaterialListCreateView.as_view(), name='material-list'),
    path('<int:pk>/', MaterialDetailView.as_view(), name='material-detail'),
]
