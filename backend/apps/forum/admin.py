from django.contrib import admin
from .models import Discussion, Reply


@admin.register(Discussion)
class DiscussionAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'subject', 'created_at']
    list_filter = ['subject', 'created_at']
    search_fields = ['title', 'content']
    raw_id_fields = ['author']


@admin.register(Reply)
class ReplyAdmin(admin.ModelAdmin):
    list_display = ['discussion', 'author', 'parent', 'created_at']
    list_filter = ['created_at']
    raw_id_fields = ['author', 'discussion', 'parent']
