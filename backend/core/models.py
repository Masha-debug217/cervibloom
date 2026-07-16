from django.db import models
from django.conf import settings


class Facility(models.Model):
    """A real public screening center. Admin-managed."""
    name = models.CharField(max_length=200)
    county = models.CharField(max_length=100)
    address = models.CharField(max_length=255, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    services = models.CharField(
        max_length=255,
        help_text="Comma-separated, e.g. 'VIA, Pap smear, Treatment'"
    )
    source_note = models.CharField(
        max_length=255, blank=True,
        help_text="Where this data was verified from (WHO/MOH report, etc.)"
    )
    is_wics_site = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.county})"


class SymptomLog(models.Model):
    """A patient's self-reported symptom entry."""
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='symptom_logs')
    symptoms = models.CharField(max_length=500, help_text="Comma-separated symptom list")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.patient.username} - {self.created_at.date()}"


class ScreeningReminder(models.Model):
    """Next recommended screening date for a patient."""
    patient = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='screening_reminder')
    next_due_date = models.DateField()
    guidance_note = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.patient.username} due {self.next_due_date}"


class VolunteerApplication(models.Model):
    """Submitted when a volunteer signs up to help with outreach."""
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CONTACTED = "CONTACTED", "Contacted"
        ACCEPTED = "ACCEPTED", "Accepted"

    volunteer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='volunteer_applications')
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.volunteer.username} - {self.status}"


class DonationRecord(models.Model):
    """
    A SIMULATED donation - no real payment processing.
    Exists purely so the flow and reporting can be demonstrated.
    """
    donor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='donations')
    amount_kes = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.donor.username} - KES {self.amount_kes} (simulated)"


class FAQItem(models.Model):
    """Info Hub content - admin-editable so it isn't hardcoded."""
    question = models.CharField(max_length=255)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.question
