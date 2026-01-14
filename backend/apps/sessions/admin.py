from django.contrib import admin
from .models import TutoringSession


@admin.register(TutoringSession)
class TutoringSessionAdmin(admin.ModelAdmin):
    list_display = ['title', 'tutor', 'student', 'subject', 'date', 'time', 'status']
    list_filter = ['status', 'subject', 'date']
    search_fields = ['title', 'tutor__username', 'student__username']
    raw_id_fields = ['tutor', 'student']
    date_hierarchy = 'date'
