from django.core.management.base import BaseCommand
from core.models import Facility, FAQItem, MythFact


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
            ("I tested HPV positive. Does that mean I have cancer?", "No. HPV is very common and most infections clear on their own. A positive result means follow-up screening or triage is needed, not a cancer diagnosis.", 5),
        ]
        for q, a, order in faqs:
            obj, created = FAQItem.objects.get_or_create(question=q, defaults={'answer': a, 'order': order})
            self.stdout.write(f"{'Created' if created else 'Already exists'}: {obj.question}")

        myths = [
            ("The HPV vaccine encourages young people to become sexually active.",
             "Studies following vaccinated and unvaccinated groups show no difference in sexual behaviour. The vaccine is given early simply because it works best before any exposure to HPV.",
             MythFact.Category.VACCINE, 1),
            ("Only women who have many sexual partners get cervical cancer.",
             "Almost all sexually active people encounter HPV at some point. A single partner is enough for transmission, so screening matters for everyone with a cervix.",
             MythFact.Category.TRANSMISSION, 2),
            ("If I feel healthy, I don't need screening.",
             "Early cervical changes and early cancer usually cause no symptoms at all. Screening is what catches them while they are easy to treat.",
             MythFact.Category.SCREENING, 3),
            ("A positive HPV test means I have cancer.",
             "It does not. Most HPV infections clear on their own. A positive test means you need follow-up checks, not that you have cancer.",
             MythFact.Category.SCREENING, 4),
            ("Cervical cancer cannot be treated in Kenya.",
             "Pre-cancer is treated at many public facilities with quick outpatient procedures, and treatment services for cancer are expanding under the national elimination plan.",
             MythFact.Category.TREATMENT, 5),
            ("The HPV vaccine causes infertility.",
             "There is no credible evidence for this. Large safety reviews have found no effect on the ability to get pregnant.",
             MythFact.Category.VACCINE, 6),
        ]
        for myth, fact, category, order in myths:
            obj, created = MythFact.objects.get_or_create(
                myth=myth, defaults={'fact': fact, 'category': category, 'order': order}
            )
            self.stdout.write(f"{'Created' if created else 'Already exists'}: {obj.myth[:48]}...")

        self.stdout.write(self.style.SUCCESS('Seeding complete.'))
