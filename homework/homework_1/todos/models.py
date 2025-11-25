from django.db import models
from django.utils import timezone


class Todo(models.Model):
    """Model representing a TODO item."""
    
    title = models.CharField(
        max_length=200,
        help_text="Brief title of the TODO"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Detailed description of the TODO"
    )
    due_date = models.DateField(
        blank=True,
        null=True,
        help_text="Due date for the TODO"
    )
    is_resolved = models.BooleanField(
        default=False,
        help_text="Whether the TODO is completed"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the TODO was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="When the TODO was last updated"
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Todo'
        verbose_name_plural = 'Todos'

    def __str__(self):
        return self.title

    def is_overdue(self):
        """Check if the TODO is overdue (not resolved and past due date)."""
        if self.is_resolved or self.due_date is None:
            return False
        return self.due_date < timezone.now().date()
