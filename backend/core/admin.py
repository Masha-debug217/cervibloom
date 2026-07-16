from django.contrib import admin
from .models import (
    Facility, SymptomLog, ScreeningReminder,
    VolunteerApplication, DonationRecord, FAQItem
)

@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = ['name', 'county', 'is_wics_site']
    list_filter = ['county', 'is_wics_site']
    search_fields = ['name', 'county']

@admin.register(FAQItem)
class FAQItemAdmin(admin.ModelAdmin):
    list_display = ['question', 'order']
    ordering = ['order']

@admin.register(VolunteerApplication)
class VolunteerApplicationAdmin(admin.ModelAdmin):
    list_display = ['volunteer', 'status', 'submitted_at']
    list_filter = ['status']

admin.site.register(SymptomLog)
admin.site.register(ScreeningReminder)
admin.site.register(DonationRecord)
