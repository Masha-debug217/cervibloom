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

    class HpvVaccineDoses(models.TextChoices):
        NONE = "0", "None"
        ONE = "1", "1 dose"
        TWO = "2", "2 doses"
        UNSURE = "unsure", "Not sure"

    class PreferredLanguage(models.TextChoices):
        EN = "EN", "English"
        SW = "SW", "Kiswahili"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.USER,
    )
    phone_number = models.CharField(max_length=20, blank=True)
    county = models.CharField(max_length=100, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    # Self-reported at signup, optional. Not yet read by any reminder or
    # recommendation feature; stored so a future Dashboard "your health
    # profile" view or the Symptom Navigator can use it without a second
    # migration.
    last_screening_year = models.CharField(
        max_length=20, blank=True,
        help_text="e.g. '2023', 'never', or 'before2015'. Self-reported, optional.",
    )
    hpv_vaccine_doses = models.CharField(
        max_length=10, choices=HpvVaccineDoses.choices, blank=True,
        help_text="Self-reported, optional.",
    )
    preferred_language = models.CharField(
        max_length=2, choices=PreferredLanguage.choices, blank=True,
        help_text="Applied to the site's language toggle right after sign-up; optional.",
    )

    def __str__(self):
        return f"{self.username} ({self.role})"
