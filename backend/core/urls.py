from rest_framework.routers import DefaultRouter
from .views import (
    FacilityViewSet, FAQItemViewSet, SymptomLogViewSet,
    ScreeningReminderViewSet, VolunteerApplicationViewSet, DonationRecordViewSet
)

router = DefaultRouter()
router.register('facilities', FacilityViewSet, basename='facility')
router.register('faqs', FAQItemViewSet, basename='faq')
router.register('symptom-logs', SymptomLogViewSet, basename='symptom-log')
router.register('screening-reminders', ScreeningReminderViewSet, basename='screening-reminder')
router.register('volunteer-applications', VolunteerApplicationViewSet, basename='volunteer-application')
router.register('donations', DonationRecordViewSet, basename='donation')

urlpatterns = router.urls
