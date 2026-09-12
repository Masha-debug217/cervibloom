from django.contrib import admin
from .models import (
    Facility, SymptomLog, ScreeningReminder,
    VolunteerApplication, DonationRecord, FAQItem, MythFact,
    Article, ArticleBookmark, BlogPost
)

@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = ['name', 'county', 'is_wics_site', 'hpv_vaccine_stock', 'pap_smear_kit_stock']
    list_filter = ['county', 'is_wics_site', 'hpv_vaccine_stock', 'pap_smear_kit_stock']
    search_fields = ['name', 'county']

@admin.register(FAQItem)
class FAQItemAdmin(admin.ModelAdmin):
    list_display = ['question', 'order']
    ordering = ['order']

@admin.register(MythFact)
class MythFactAdmin(admin.ModelAdmin):
    list_display = ['myth', 'category', 'order']
    list_filter = ['category']
    ordering = ['order']

@admin.register(VolunteerApplication)
class VolunteerApplicationAdmin(admin.ModelAdmin):
    list_display = ['volunteer', 'status', 'submitted_at']
    list_filter = ['status']

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'source_name', 'order']
    ordering = ['order']

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'status', 'created_at']
    list_filter = ['status']

admin.site.register(SymptomLog)
admin.site.register(ScreeningReminder)
admin.site.register(DonationRecord)
admin.site.register(ArticleBookmark)
