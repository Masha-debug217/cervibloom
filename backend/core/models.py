from django.db import models
from django.conf import settings


class Facility(models.Model):
    """A real public screening center. Admin-managed."""

    class StockStatus(models.TextChoices):
        # UNKNOWN is the default so seeded real facilities don't claim a
        # supply level nobody has actually reported. Admins set a real value.
        UNKNOWN = "UNKNOWN", "Not reported"
        IN_STOCK = "IN_STOCK", "In stock"
        LOW_STOCK = "LOW_STOCK", "Low stock"
        OUT_OF_STOCK = "OUT_OF_STOCK", "Out of stock"

    name = models.CharField(max_length=200)
    county = models.CharField(max_length=100)
    address = models.CharField(max_length=255, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    services = models.CharField(
        max_length=255,
        help_text="Comma-separated, e.g. 'VIA, Pap smear, Treatment'"
    )
    services_sw = models.CharField(
        max_length=255, blank=True,
        help_text="Kiswahili translation of `services`. Optional; the English list is shown if this is blank."
    )
    source_note = models.CharField(
        max_length=255, blank=True,
        help_text="Where this data was verified from (WHO/MOH report, etc.)"
    )
    is_wics_site = models.BooleanField(default=False)
    hpv_vaccine_stock = models.CharField(
        max_length=20, choices=StockStatus.choices, default=StockStatus.UNKNOWN
    )
    pap_smear_kit_stock = models.CharField(
        max_length=20, choices=StockStatus.choices, default=StockStatus.UNKNOWN
    )

    def __str__(self):
        return f"{self.name} ({self.county})"


class SymptomLog(models.Model):
    """
    A patient's Symptom Navigator entry.

    `answers` holds the structured yes/no responses keyed by question
    (see core/symptom_navigator.py). `risk_tier` is the deterministic tier
    computed server-side from those answers. `symptoms` is kept as a short
    human-readable summary string for the history list and Django admin.
    """
    class RiskTier(models.TextChoices):
        ROUTINE = "ROUTINE", "Routine"
        DISCUSS = "DISCUSS", "Discuss at next visit"
        SEEK_CARE = "SEEK_CARE", "Seek care soon"

    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='symptom_logs')
    symptoms = models.CharField(max_length=500, blank=True, help_text="Auto-generated summary of the 'yes' answers")
    answers = models.JSONField(default=dict, blank=True, help_text="Structured yes/no answers keyed by question")
    risk_tier = models.CharField(max_length=20, choices=RiskTier.choices, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.patient.username} - {self.created_at.date()} ({self.risk_tier or 'n/a'})"


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
    is_anonymous = models.BooleanField(
        default=False,
        help_text="If set, the donor asked not to be named in any public acknowledgement.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        who = "Anonymous" if self.is_anonymous else self.donor.username
        return f"{who} - KES {self.amount_kes} (simulated)"


class FAQItem(models.Model):
    """Info Hub content - admin-editable so it isn't hardcoded."""
    question = models.CharField(max_length=255)
    answer = models.TextField()
    question_sw = models.CharField(
        max_length=255, blank=True, help_text="Kiswahili translation. Optional; falls back to the English question."
    )
    answer_sw = models.TextField(
        blank=True, help_text="Kiswahili translation. Optional; falls back to the English answer."
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.question


class Article(models.Model):
    """
    A longer-form science article for the Info Hub (HPV/cervical cancer
    research, prevention, and treatment), admin-editable like FAQItem and
    MythFact rather than hardcoded in the frontend.
    """
    title = models.CharField(max_length=255)
    summary = models.CharField(max_length=400, help_text="Short teaser shown in the article list.")
    body = models.TextField(help_text="Full article text.")
    source_name = models.CharField(
        max_length=150, blank=True,
        help_text="Where this is drawn from, e.g. 'WHO Africa' or 'IARC/HPV Information Centre'."
    )
    source_url = models.URLField(blank=True, help_text="Link to the original source, if any.")
    title_sw = models.CharField(
        max_length=255, blank=True, help_text="Kiswahili translation. Optional; falls back to the English title."
    )
    summary_sw = models.CharField(
        max_length=400, blank=True, help_text="Kiswahili translation. Optional; falls back to the English summary."
    )
    body_sw = models.TextField(
        blank=True, help_text="Kiswahili translation. Optional; falls back to the English body."
    )
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title


class ArticleBookmark(models.Model):
    """A user's saved article, for the Info Hub's Bookmarks feature."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='article_bookmarks')
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'article')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} bookmarked {self.article.title}"


class BlogPost(models.Model):
    """
    A survivor's story for the Survivor Blog. Unlike FAQItem/Article, this is
    user-submitted rather than admin-authored, so it goes through a review
    queue before it's shown publicly: an Admin moves it from PENDING to
    PUBLISHED (or REJECTED) via the dedicated `status` action, the same
    pattern already used for VolunteerApplication.
    """
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending review"
        PUBLISHED = "PUBLISHED", "Published"
        REJECTED = "REJECTED", "Rejected"

    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blog_posts')
    title = models.CharField(max_length=200)
    body = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} by {self.author.username} ({self.status})"


class MythFact(models.Model):
    """
    A myth-vs-fact card for the Info Hub. Admin-managed exactly like FAQItem
    so the content isn't hardcoded in the React app.
    """
    class Category(models.TextChoices):
        VACCINE = "VACCINE", "HPV vaccine"
        SCREENING = "SCREENING", "Screening"
        TRANSMISSION = "TRANSMISSION", "Transmission & risk"
        TREATMENT = "TREATMENT", "Treatment"
        GENERAL = "GENERAL", "General"

    myth = models.CharField(max_length=255, help_text="The false belief, stated plainly.")
    fact = models.TextField(help_text="The correction, medically grounded.")
    myth_sw = models.CharField(
        max_length=255, blank=True, help_text="Kiswahili translation. Optional; falls back to the English myth."
    )
    fact_sw = models.TextField(
        blank=True, help_text="Kiswahili translation. Optional; falls back to the English fact."
    )
    category = models.CharField(
        max_length=20, choices=Category.choices, default=Category.GENERAL
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.myth
