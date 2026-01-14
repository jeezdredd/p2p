from django.db import models
from django.conf import settings


class TutoringSession(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    tutor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tutoring_sessions'
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='learning_sessions',
        null=True,
        blank=True
    )
    subject = models.ForeignKey(
        'users.Subject',
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    title = models.CharField(max_length=200, default='Tutoring Session')
    date = models.DateField()
    time = models.TimeField()
    duration = models.PositiveIntegerField(default=60)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'time']

    def __str__(self):
        return f"{self.subject.name} - {self.tutor.username} - {self.date}"
