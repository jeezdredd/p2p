from django.contrib import admin
from .models import SupportQuery


@admin.register(SupportQuery)
class SupportQueryAdmin(admin.ModelAdmin):
    list_display = ['subject', 'name', 'email', 'resolved', 'created_at']
    list_filter = ['resolved', 'created_at']
    search_fields = ['subject', 'name', 'email', 'message']
    readonly_fields = ['created_at']
    actions = ['mark_resolved']

    @admin.action(description='Mark selected queries as resolved')
    def mark_resolved(self, request, queryset):
        queryset.update(resolved=True)
