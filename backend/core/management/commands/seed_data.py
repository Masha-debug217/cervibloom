from django.core.management.base import BaseCommand
from core.models import Facility, FAQItem, MythFact, Article


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

        articles = [
            (
                "How HPV Leads to Cervical Cancer",
                "The link between a common virus and a preventable cancer, and why it takes years to develop.",
                "Almost all cervical cancer is caused by persistent infection with a handful of "
                "high-risk types of human papillomavirus (HPV), a virus so common that most "
                "sexually active people are exposed to it at some point in their lives. In the "
                "large majority of cases, the immune system clears the infection within one to "
                "two years and nothing further happens.\n\n"
                "Cervical cancer only develops when a high-risk HPV infection persists for years "
                "and causes progressive changes in the cells lining the cervix. These changes, "
                "called cervical intraepithelial neoplasia, move through recognizable stages "
                "before becoming cancer, which is exactly why screening works: a Pap smear or VIA "
                "test can catch these changes while they are still just abnormal cells, long "
                "before they would ever become a tumor.\n\n"
                "This slow timeline, typically ten to twenty years from persistent infection to "
                "invasive cancer, is what makes cervical cancer one of the most preventable "
                "cancers there is, provided screening and follow-up treatment are available.",
                "Jinsi HPV Inavyosababisha Saratani ya Shingo ya Kizazi",
                "Uhusiano kati ya virusi vinavyopatikana kwa wingi na saratani inayozuilika, na kwa nini inachukua miaka kujitokeza.",
                "Karibu saratani zote za shingo ya kizazi husababishwa na maambukizi endelevu ya "
                "aina chache za HPV zenye hatari kubwa, virusi ambavyo ni vya kawaida sana hivi "
                "kwamba watu wengi wanaofanya ngono hupata maambukizi wakati fulani wa maisha "
                "yao. Katika hali nyingi, mfumo wa kinga huondoa maambukizi ndani ya mwaka mmoja "
                "au miwili na hakuna kinachoendelea zaidi.\n\n"
                "Saratani ya shingo ya kizazi hujitokeza tu wakati maambukizi ya HPV yenye hatari "
                "kubwa yanapoendelea kwa miaka mingi na kusababisha mabadiliko ya taratibu katika "
                "seli zinazofunika shingo ya kizazi. Mabadiliko haya hupitia hatua zinazojulikana "
                "kabla ya kuwa saratani, na hii ndiyo hasa sababu uchunguzi unafanya kazi: kipimo "
                "cha Pap au VIA kinaweza kugundua mabadiliko haya wakati bado ni seli zisizo za "
                "kawaida, muda mrefu kabla hazijawa uvimbe.\n\n"
                "Muda huu mrefu, kwa kawaida miaka kumi hadi ishirini kutoka maambukizi endelevu "
                "hadi saratani halisi, ndio unaofanya saratani ya shingo ya kizazi kuwa miongoni "
                "mwa saratani zinazozuilika zaidi, ikiwa uchunguzi na matibabu ya ufuatiliaji "
                "vinapatikana.",
                "WHO / IARC public guidance",
                "https://www.who.int/news-room/fact-sheets/detail/cervical-cancer",
                1,
            ),
            (
                "WHO's Plan to Eliminate Cervical Cancer",
                "The global 90-70-90 targets for 2030, and what they mean for Kenya.",
                "In 2020, the World Health Organization launched a global strategy to eliminate "
                "cervical cancer as a public health problem, the first time WHO has set an "
                "elimination target for any cancer. The strategy is built around three targets to "
                "be reached by 2030, often summarized as 90-70-90: 90% of girls fully vaccinated "
                "against HPV by age 15, 70% of women screened with a high-performance test by age "
                "35 and again by 45, and 90% of women identified with cervical disease receiving "
                "treatment.\n\n"
                "Kenya has taken concrete steps toward these targets, including offering the HPV "
                "vaccine free to eligible girls at public health facilities and expanding VIA and "
                "Pap smear screening under the national elimination action plan, including through "
                "the Women's Integrated Cancer Services (WICS) project reflected in this app's "
                "Screening Directory.\n\n"
                "Meeting all three targets in every country, modeling suggests, could avert "
                "millions of cervical cancer deaths over the coming decades. No single target is "
                "enough on its own: a vaccinated generation still needs screening for decades to "
                "come, and screening only saves lives if the women it identifies can actually get "
                "treated.",
                "Mpango wa WHO wa Kutokomeza Saratani ya Shingo ya Kizazi",
                "Malengo ya kimataifa ya 90-70-90 ya mwaka 2030, na yanamaanisha nini kwa Kenya.",
                "Mnamo mwaka 2020, Shirika la Afya Duniani (WHO) lilizindua mkakati wa kimataifa "
                "wa kutokomeza saratani ya shingo ya kizazi kama tatizo la afya ya umma, mara ya "
                "kwanza WHO kuweka lengo la kutokomeza kwa saratani yoyote. Mkakati huu umejengwa "
                "kwenye malengo matatu ya kufikiwa ifikapo 2030, mara nyingi hufupishwa kama "
                "90-70-90: asilimia 90 ya wasichana wapewe chanjo kamili ya HPV kabla ya umri wa "
                "miaka 15, asilimia 70 ya wanawake wapimwe kwa kipimo bora kufikia umri wa miaka "
                "35 na tena miaka 45, na asilimia 90 ya wanawake waliogundulika na ugonjwa wa "
                "shingo ya kizazi wapate matibabu.\n\n"
                "Kenya imepiga hatua za dhati kuelekea malengo haya, ikiwa ni pamoja na kutoa "
                "chanjo ya HPV bila malipo kwa wasichana wanaostahili katika vituo vya afya vya "
                "umma na kupanua uchunguzi wa VIA na kipimo cha Pap chini ya mpango wa kitaifa wa "
                "kutokomeza saratani, ikiwemo kupitia mradi wa Women's Integrated Cancer Services "
                "(WICS) unaoonekana katika Orodha ya Vituo vya Uchunguzi vya programu hii.\n\n"
                "Kufikia malengo yote matatu katika kila nchi, kulingana na uchambuzi wa "
                "kitakwimu, kunaweza kuzuia vifo vya mamilioni ya watu kutokana na saratani ya "
                "shingo ya kizazi katika miongo ijayo. Hakuna lengo moja linalotosha peke yake: "
                "kizazi kilichopewa chanjo bado kinahitaji uchunguzi kwa miongo mingi ijayo, na "
                "uchunguzi huokoa maisha tu kama wanawake wanaogundulika wanaweza kupata matibabu "
                "kikweli.",
                "WHO Cervical Cancer Elimination Initiative",
                "https://www.who.int/initiatives/cervical-cancer-elimination-initiative",
                2,
            ),
            (
                "Self-Sampling: Making HPV Testing Easier to Reach",
                "A cotton swab a woman can use herself is expanding who screening can reach.",
                "One of the biggest barriers to cervical screening is not awareness, it's the "
                "pelvic exam itself. Some women delay or skip screening because of discomfort, "
                "modesty concerns, or simply not being able to get to a facility during clinic "
                "hours. Self-sampling addresses this directly: a woman collects her own vaginal "
                "swab, in private, using a simple kit, and the swab is then tested in a lab for "
                "high-risk HPV using the same molecular tests used on clinician-collected "
                "samples.\n\n"
                "Research reviewed by WHO has found self-collected samples to be about as "
                "accurate as clinician-collected ones for detecting high-risk HPV, which is why "
                "self-sampling now features in WHO screening guidance as a way to reach women who "
                "would otherwise not be screened at all, including in outreach and community "
                "settings rather than only fixed clinics.\n\n"
                "Self-sampling is not a replacement for follow-up care. A positive result still "
                "means a woman needs a clinical visit for triage, which may include a Pap smear, "
                "VIA, or colposcopy, since HPV testing alone identifies infection, not whether "
                "cell changes are already present.",
                "Kujipima Mwenyewe: Kurahisisha Ufikiaji wa Kipimo cha HPV",
                "Kifaa rahisi ambacho mwanamke anaweza kujitumia mwenyewe kinapanua ni akina nani wanaoweza kufikiwa na uchunguzi.",
                "Moja ya vikwazo vikubwa vya uchunguzi wa shingo ya kizazi si ukosefu wa uelewa, "
                "bali uchunguzi wa nyonga wenyewe. Baadhi ya wanawake huchelewesha au kuruka "
                "uchunguzi kwa sababu ya usumbufu, aibu, au kutoweza kufika kituoni wakati wa "
                "huduma. Kujipima mwenyewe kunashughulikia hili moja kwa moja: mwanamke "
                "hukusanya sampuli yake ya ukeni mwenyewe, kwa faragha, akitumia kifaa rahisi, na "
                "sampuli hiyo hupimwa kwenye maabara kwa HPV yenye hatari kubwa kwa kutumia "
                "vipimo vile vile vinavyotumika kwa sampuli zinazokusanywa na wahudumu wa afya.\n\n"
                "Utafiti uliopitiwa na WHO umegundua sampuli za kujikusanya mwenyewe zina usahihi "
                "unaokaribiana na zile zinazokusanywa na wahudumu wa afya katika kugundua HPV "
                "yenye hatari kubwa, ndiyo maana kujipima mwenyewe sasa kunatajwa katika mwongozo "
                "wa uchunguzi wa WHO kama njia ya kuwafikia wanawake ambao vinginevyo wasingepimwa "
                "kabisa, ikiwemo katika shughuli za uhamasishaji na maeneo ya jamii badala ya "
                "vituo tu.\n\n"
                "Kujipima mwenyewe si mbadala wa huduma ya ufuatiliaji. Matokeo chanya bado "
                "yanamaanisha mwanamke anahitaji ziara ya kliniki kwa uchunguzi wa ziada, ambao "
                "unaweza kuhusisha kipimo cha Pap, VIA, au colposcopy, kwa kuwa kipimo cha HPV "
                "peke yake hutambua maambukizi, si kama mabadiliko ya seli tayari yapo.",
                "WHO / IARC public guidance",
                "",
                3,
            ),
            (
                "Why the HPV Vaccine Works Best Given Early",
                "The science behind vaccinating before, not after, exposure to the virus.",
                "The HPV vaccine works by training the immune system to recognize the virus's "
                "outer shell before a real infection ever happens. Once someone has already been "
                "exposed to a particular HPV type, the vaccine can no longer prevent that specific "
                "exposure, which is why health authorities recommend vaccinating girls (and in "
                "many programs, boys) in early adolescence, well before most people become "
                "sexually active.\n\n"
                "This timing is the entire reason the vaccine is offered to schoolgirls rather "
                "than adult women. It has nothing to do with assuming or encouraging early sexual "
                "activity, a claim that long-running studies comparing vaccinated and unvaccinated "
                "groups have found no evidence for. It is simply how vaccines that prevent "
                "infection, rather than treat disease, work best: before exposure.\n\n"
                "Countries with sustained high vaccination coverage, such as those in parts of "
                "Scandinavia and the United Kingdom, have already recorded sharp drops in "
                "HPV infections and precancerous lesions among vaccinated cohorts, real-world "
                "evidence that the protection holds up well beyond clinical trials.",
                "Kwa Nini Chanjo ya HPV Hufanya Kazi Vizuri Zaidi Ikitolewa Mapema",
                "Sayansi nyuma ya kupewa chanjo kabla, si baada, ya kukutana na virusi.",
                "Chanjo ya HPV hufanya kazi kwa kufundisha mfumo wa kinga kutambua ganda la nje la "
                "virusi kabla ya maambukizi halisi kutokea. Mtu akishakutana na aina fulani ya "
                "HPV, chanjo haiwezi tena kuzuia maambukizi hayo mahususi, ndiyo maana mamlaka za "
                "afya zinapendekeza kutoa chanjo kwa wasichana (na katika mipango mingi, wavulana "
                "pia) katika umri mdogo wa ujana, muda mrefu kabla ya watu wengi kuanza kufanya "
                "ngono.\n\n"
                "Muda huu ndio sababu kamili ya kutoa chanjo kwa wasichana wa shule badala ya "
                "wanawake wazima. Halihusiani kabisa na dhana ya kuhamasisha ngono za mapema, "
                "dai ambalo tafiti za muda mrefu zinazolinganisha makundi yaliyopewa chanjo na "
                "yasiyopewa hazijapata ushahidi wowote. Ni jinsi tu chanjo zinazozuia maambukizi, "
                "badala ya kutibu ugonjwa, zinavyofanya kazi vizuri zaidi: kabla ya kukutana na "
                "virusi.\n\n"
                "Nchi zenye chanjo endelevu ya kiwango cha juu, kama sehemu za Scandinavia na "
                "Uingereza, tayari zimerekodi kushuka kwa kasi kwa maambukizi ya HPV na "
                "mabadiliko ya awali ya saratani miongoni mwa makundi yaliyopewa chanjo, ushahidi "
                "wa kihalisia kwamba kinga hiyo inadumu vizuri zaidi ya majaribio ya kimatibabu.",
                "Global HPV vaccine research consensus",
                "",
                4,
            ),
        ]
        for title, summary, body, title_sw, summary_sw, body_sw, source_name, source_url, order in articles:
            obj, created = Article.objects.get_or_create(
                title=title,
                defaults={
                    'summary': summary, 'body': body,
                    'title_sw': title_sw, 'summary_sw': summary_sw, 'body_sw': body_sw,
                    'source_name': source_name, 'source_url': source_url, 'order': order,
                }
            )
            if not created and not obj.title_sw:
                obj.title_sw, obj.summary_sw, obj.body_sw = title_sw, summary_sw, body_sw
                obj.save(update_fields=['title_sw', 'summary_sw', 'body_sw'])
            self.stdout.write(f"{'Created' if created else 'Already exists'}: {obj.title}")

        self.stdout.write(self.style.SUCCESS('Seeding complete.'))
