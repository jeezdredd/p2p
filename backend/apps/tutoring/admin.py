from django.contrib import admin
from .models import TutoringSession, SessionReview


@admin.register(TutoringSession)
class TutoringSessionAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'tutor', 'student', 'subject', 'date', 
        'time', 'status', 'is_confirmed'
    ]
    list_filter = ['status', 'is_confirmed', 'subject', 'date']
    search_fields = ['title', 'tutor__username', 'student__username']
    raw_id_fields = ['tutor', 'student', 'cancelled_by']
    date_hierarchy = 'date'
    readonly_fields = ['created_at', 'updated_at', 'confirmed_at']


@admin.register(SessionReview)
class SessionReviewAdmin(admin.ModelAdmin):
    list_display = ['session', 'reviewer', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['session__title', 'reviewer__username', 'comment']
    raw_id_fields = ['session', 'reviewer']
    readonly_fields = ['created_at', 'updated_at']
