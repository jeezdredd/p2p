from django.contrib import admin
from .models import StudyMaterial


@admin.register(StudyMaterial)
class StudyMaterialAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'subject', 'created_at']
    list_filter = ['subject', 'created_at']
    search_fields = ['title', 'description']
    raw_id_fields = ['author']
