from django.core.management.base import BaseCommand
from core.models import Facility, FAQItem


class Command(BaseCommand):
    help = "Seeds the database with real facility data and starter FAQ content."

    def handle(self, *args, **options):
        # Coordinates are approximate hospital locations (decimal degrees),
        # good enough to open a useful "Get directions" pin in Google Maps.
        facilities = [
            dict(name="Kenyatta National Hospital", county="Nairobi", services="VIA, Pap smear, Treatment", source_note="MOH/WHO public reporting", is_wics_site=False, latitude=-1.3018, longitude=36.8058),
            dict(name="Moi Teaching & Referral Hospital", county="Uasin Gishu", services="VIA, Treatment", source_note="MOH/WHO public reporting", is_wics_site=False, latitude=0.5167, longitude=35.2833),
            dict(name="Bungoma County Referral Hospital", county="Bungoma", services="VIA", source_note="WICS project site", is_wics_site=True, latitude=0.5635, longitude=34.5606),
            dict(name="Nyandarua County Referral Hospital", county="Nyandarua", services="VIA", source_note="WICS project site", is_wics_site=True, latitude=-0.2730, longitude=36.3778),
            dict(name="Kisumu County Referral Hospital", county="Kisumu", services="Screening (expansion)", source_note="National Cancer Elimination Action Plan", is_wics_site=False, latitude=-0.0917, longitude=34.7680),
            dict(name="Nyeri County Referral Hospital", county="Nyeri", services="Screening (expansion)", source_note="National Cancer Elimination Action Plan", is_wics_site=False, latitude=-0.4169, longitude=36.9514),
            dict(name="Kakamega County General Hospital", county="Kakamega", services="Screening (expansion)", source_note="National Cancer Elimination Action Plan", is_wics_site=False, latitude=0.2827, longitude=34.7519),
            dict(name="Kisii Teaching & Referral Hospital", county="Kisii", services="Screening (expansion)", source_note="National Cancer Elimination Action Plan", is_wics_site=False, latitude=-0.6817, longitude=34.7796),
            dict(name="Meru Teaching & Referral Hospital", county="Meru", services="Screening (expansion)", source_note="National Cancer Elimination Action Plan", is_wics_site=False, latitude=0.0470, longitude=37.6559),
        ]
        for f in facilities:
            obj, created = Facility.objects.get_or_create(name=f['name'], defaults=f)
            if not created and (obj.latitude is None or obj.longitude is None):
                # Backfill coordinates onto rows seeded before this change.
                obj.latitude, obj.longitude = f['latitude'], f['longitude']
                obj.save(update_fields=['latitude', 'longitude'])
            self.stdout.write(f"{'Created' if created else 'Already exists'}: {obj.name}")

        faqs = [
            ("Is the HPV vaccine safe?", "Yes. The HPV vaccine has been given to millions of people worldwide and is offered free to eligible girls at public health facilities in Kenya. It protects against the virus that causes most cervical cancers.", 1),
            ("Does the HPV vaccine cause infertility?", "No credible scientific evidence supports this claim. It has been studied extensively and does not affect fertility.", 2),
            ("What's the difference between VIA and a Pap smear?", "VIA (Visual Inspection with Acetic Acid) is a low-cost screening method using a vinegar-based solution, common in Kenyan public facilities. A Pap smear examines cervical cells under a microscope and requires more lab capacity.", 3),
            ("How often should I get screened?", "WHO recommends women be screened at least once by age 35 and again by 45, with more frequent screening depending on individual risk and prior results. Always confirm timing with a healthcare provider.", 4),
            ("I tested HPV positive — does that mean I have cancer?", "No. HPV is very common and most infections clear on their own. A positive result means follow-up screening or triage is needed, not a cancer diagnosis.", 5),
        ]
        for q, a, order in faqs:
            obj, created = FAQItem.objects.get_or_create(question=q, defaults={'answer': a, 'order': order})
            self.stdout.write(f"{'Created' if created else 'Already exists'}: {obj.question}")

        self.stdout.write(self.style.SUCCESS('Seeding complete.'))
