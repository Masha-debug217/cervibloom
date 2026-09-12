from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model with a role field.

    WHY a custom user model instead of Django's default:
    Django's built-in User has no concept of "type of account."
    Everyone who signs up gets the same access (their own symptom logs,
    screening reminders, volunteer applications, and donations), but an
    Admin account also manages the Info Hub content, screening directory,
    and volunteer applications for everyone else. We extend AbstractUser
    and add `role` to tell the two apart.

    IMPORTANT: this must be set as AUTH_USER_MODEL in settings.py
    BEFORE the first migration is run, since swapping user models
    later is painful.
    """

    class Role(models.TextChoices):
        USER = "USER", "User"
        ADMIN = "ADMIN", "Admin"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.USER,
    )
    phone_number = models.CharField(max_length=20, blank=True)
    county = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
