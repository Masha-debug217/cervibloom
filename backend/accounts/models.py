from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model with a role field.

    WHY a custom user model instead of Django's default:
    Django's built-in User has no concept of "type of account."
    We need Patient / Volunteer / Admin to behave differently
    (different data they can see, different dashboard, different
    permissions) so we extend AbstractUser and add `role`.

    IMPORTANT: this must be set as AUTH_USER_MODEL in settings.py
    BEFORE the first migration is run, since swapping user models
    later is painful.
    """

    class Role(models.TextChoices):
        PATIENT = "PATIENT", "Patient"
        VOLUNTEER = "VOLUNTEER", "Volunteer"
        ADMIN = "ADMIN", "Admin"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.PATIENT,
    )
    phone_number = models.CharField(max_length=20, blank=True)
    county = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
