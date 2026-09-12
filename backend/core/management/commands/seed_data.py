from django.core.management.base import BaseCommand
from core.models import Facility, FAQItem, MythFact


class Command(BaseCommand):
    help = "Seeds the database with real facility data and starter FAQ content."

    def handle(self, *args, **options):
        # Coordinates are approximate hospital locations (decimal degrees),
        # good enough to open a useful "Get directions" pin in Google Maps.
        facilities = [
            dict(name="Kenyatta National Hospital", county="Nairobi", services="VIA, Pap smear, Treatment", services_sw="VIA, Kipimo cha Pap, Matibabu", source_note="MOH/WHO public reporting", is_wics_site=False, latitude=-1.3018, longitude=36.8058),
            dict(name="Moi Teaching & Referral Hospital", county="Uasin Gishu", services="VIA, Treatment", services_sw="VIA, Matibabu", source_note="MOH/WHO public reporting", is_wics_site=False, latitude=0.5167, longitude=35.2833),
            dict(name="Bungoma County Referral Hospital", county="Bungoma", services="VIA", services_sw="VIA", source_note="WICS project site", is_wics_site=True, latitude=0.5635, longitude=34.5606),
            dict(name="Nyandarua County Referral Hospital", county="Nyandarua", services="VIA", services_sw="VIA", source_note="WICS project site", is_wics_site=True, latitude=-0.2730, longitude=36.3778),
            dict(name="Kisumu County Referral Hospital", county="Kisumu", services="Screening (expansion)", services_sw="Uchunguzi (upanuzi)", source_note="National Cancer Elimination Action Plan", is_wics_site=False, latitude=-0.0917, longitude=34.7680),
            dict(name="Nyeri County Referral Hospital", county="Nyeri", services="Screening (expansion)", services_sw="Uchunguzi (upanuzi)", source_note="National Cancer Elimination Action Plan", is_wics_site=False, latitude=-0.4169, longitude=36.9514),
            dict(name="Kakamega County General Hospital", county="Kakamega", services="Screening (expansion)", services_sw="Uchunguzi (upanuzi)", source_note="National Cancer Elimination Action Plan", is_wics_site=False, latitude=0.2827, longitude=34.7519),
            dict(name="Kisii Teaching & Referral Hospital", county="Kisii", services="Screening (expansion)", services_sw="Uchunguzi (upanuzi)", source_note="National Cancer Elimination Action Plan", is_wics_site=False, latitude=-0.6817, longitude=34.7796),
            dict(name="Meru Teaching & Referral Hospital", county="Meru", services="Screening (expansion)", services_sw="Uchunguzi (upanuzi)", source_note="National Cancer Elimination Action Plan", is_wics_site=False, latitude=0.0470, longitude=37.6559),
        ]
        for f in facilities:
            obj, created = Facility.objects.get_or_create(name=f['name'], defaults=f)
            if not created and (obj.latitude is None or obj.longitude is None):
                # Backfill coordinates onto rows seeded before this change.
                obj.latitude, obj.longitude = f['latitude'], f['longitude']
                obj.save(update_fields=['latitude', 'longitude'])
            if not created and not obj.services_sw:
                # Backfill the Kiswahili translation onto rows seeded before it existed.
                obj.services_sw = f['services_sw']
                obj.save(update_fields=['services_sw'])
            self.stdout.write(f"{'Created' if created else 'Already exists'}: {obj.name}")

        faqs = [
            ("Is the HPV vaccine safe?",
             "Yes. The HPV vaccine has been given to millions of people worldwide and is offered free to eligible girls at public health facilities in Kenya. It protects against the virus that causes most cervical cancers.",
             "Je, chanjo ya HPV ni salama?",
             "Ndiyo. Chanjo ya HPV imetolewa kwa mamilioni ya watu duniani kote na inatolewa bila malipo kwa wasichana wanaostahili katika vituo vya afya vya umma nchini Kenya. Inakinga dhidi ya virusi vinavyosababisha saratani nyingi za shingo ya kizazi.",
             1),
            ("Does the HPV vaccine cause infertility?",
             "No credible scientific evidence supports this claim. It has been studied extensively and does not affect fertility.",
             "Je, chanjo ya HPV husababisha ugumba?",
             "Hakuna ushahidi wa kisayansi unaothibitisha dai hili. Chanjo hii imefanyiwa utafiti wa kina na haiathiri uwezo wa kupata watoto.",
             2),
            ("What's the difference between VIA and a Pap smear?",
             "VIA (Visual Inspection with Acetic Acid) is a low-cost screening method using a vinegar-based solution, common in Kenyan public facilities. A Pap smear examines cervical cells under a microscope and requires more lab capacity.",
             "Kuna tofauti gani kati ya VIA na kipimo cha Pap?",
             "VIA (Ukaguzi wa Kuona kwa Kutumia Siki) ni njia ya uchunguzi yenye gharama nafuu inayotumia myeyusho wa siki, inayopatikana kawaida katika vituo vya afya vya umma nchini Kenya. Kipimo cha Pap huchunguza seli za shingo ya kizazi kwa darubini na kinahitaji uwezo zaidi wa maabara.",
             3),
            ("How often should I get screened?",
             "WHO recommends women be screened at least once by age 35 and again by 45, with more frequent screening depending on individual risk and prior results. Always confirm timing with a healthcare provider.",
             "Ni mara ngapi ninapaswa kupimwa?",
             "WHO inapendekeza wanawake wapimwe angalau mara moja kufikia umri wa miaka 35 na tena kufikia miaka 45, huku uchunguzi wa mara kwa mara zaidi ukitegemea hatari ya mtu binafsi na matokeo ya awali. Daima thibitisha muda na mtoa huduma wa afya.",
             4),
            ("I tested HPV positive. Does that mean I have cancer?",
             "No. HPV is very common and most infections clear on their own. A positive result means follow-up screening or triage is needed, not a cancer diagnosis.",
             "Nimepimwa na kupatikana na HPV. Je, hii inamaanisha nina saratani?",
             "Hapana. HPV ni jambo la kawaida sana na maambukizi mengi hupona yenyewe. Matokeo chanya yanamaanisha uchunguzi wa ziada unahitajika, si utambuzi wa saratani.",
             5),
        ]
        for q, a, q_sw, a_sw, order in faqs:
            obj, created = FAQItem.objects.get_or_create(
                question=q, defaults={'answer': a, 'question_sw': q_sw, 'answer_sw': a_sw, 'order': order}
            )
            if not created and not obj.question_sw:
                obj.question_sw, obj.answer_sw = q_sw, a_sw
                obj.save(update_fields=['question_sw', 'answer_sw'])
            self.stdout.write(f"{'Created' if created else 'Already exists'}: {obj.question}")

        myths = [
            ("The HPV vaccine encourages young people to become sexually active.",
             "Studies following vaccinated and unvaccinated groups show no difference in sexual behaviour. The vaccine is given early simply because it works best before any exposure to HPV.",
             "Chanjo ya HPV huwahamasisha vijana kuanza ngono mapema.",
             "Tafiti zinazofuatilia vikundi vilivyopewa chanjo na visivyopewa hazionyeshi tofauti yoyote katika tabia za kingono. Chanjo hutolewa mapema kwa sababu inafanya kazi vizuri zaidi kabla ya kukutana na HPV.",
             MythFact.Category.VACCINE, 1),
            ("Only women who have many sexual partners get cervical cancer.",
             "Almost all sexually active people encounter HPV at some point. A single partner is enough for transmission, so screening matters for everyone with a cervix.",
             "Ni wanawake wenye wapenzi wengi wa kingono pekee ndio hupata saratani ya shingo ya kizazi.",
             "Karibu watu wote wanaofanya ngono hukutana na HPV wakati fulani. Mpenzi mmoja tu anatosha kuambukiza, hivyo uchunguzi ni muhimu kwa kila mwenye shingo ya kizazi.",
             MythFact.Category.TRANSMISSION, 2),
            ("If I feel healthy, I don't need screening.",
             "Early cervical changes and early cancer usually cause no symptoms at all. Screening is what catches them while they are easy to treat.",
             "Kama najisikia mzima, sihitaji kupimwa.",
             "Mabadiliko ya awali ya shingo ya kizazi na saratani ya awali kwa kawaida hayaonyeshi dalili zozote. Uchunguzi ndio unaogundua mabadiliko haya wakati bado ni rahisi kutibu.",
             MythFact.Category.SCREENING, 3),
            ("A positive HPV test means I have cancer.",
             "It does not. Most HPV infections clear on their own. A positive test means you need follow-up checks, not that you have cancer.",
             "Kipimo chanya cha HPV kinamaanisha nina saratani.",
             "Hakumaanishi hivyo. Maambukizi mengi ya HPV hupona yenyewe. Kipimo chanya kinamaanisha unahitaji uchunguzi wa ziada, si kwamba una saratani.",
             MythFact.Category.SCREENING, 4),
            ("Cervical cancer cannot be treated in Kenya.",
             "Pre-cancer is treated at many public facilities with quick outpatient procedures, and treatment services for cancer are expanding under the national elimination plan.",
             "Saratani ya shingo ya kizazi haiwezi kutibiwa nchini Kenya.",
             "Hatua za awali kabla ya saratani hutibiwa katika vituo vingi vya umma kwa taratibu za haraka za nje, na huduma za matibabu ya saratani zinaendelea kupanuka chini ya mpango wa kitaifa wa kutokomeza ugonjwa huu.",
             MythFact.Category.TREATMENT, 5),
            ("The HPV vaccine causes infertility.",
             "There is no credible evidence for this. Large safety reviews have found no effect on the ability to get pregnant.",
             "Chanjo ya HPV husababisha ugumba.",
             "Hakuna ushahidi wa kuaminika kwa hili. Tafiti kubwa za usalama hazijapata athari yoyote kwa uwezo wa kupata mimba.",
             MythFact.Category.VACCINE, 6),
        ]
        for myth, fact, myth_sw, fact_sw, category, order in myths:
            obj, created = MythFact.objects.get_or_create(
                myth=myth,
                defaults={'fact': fact, 'myth_sw': myth_sw, 'fact_sw': fact_sw, 'category': category, 'order': order}
            )
            if not created and not obj.myth_sw:
                obj.myth_sw, obj.fact_sw = myth_sw, fact_sw
                obj.save(update_fields=['myth_sw', 'fact_sw'])
            self.stdout.write(f"{'Created' if created else 'Already exists'}: {obj.myth[:48]}...")

        self.stdout.write(self.style.SUCCESS('Seeding complete.'))
