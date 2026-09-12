"""
The Symptom Navigator question set and its scoring rule.

This is deliberately a small, transparent, DETERMINISTIC rule set - not a
model, not a fabricated "percentage risk". Given the same answers it always
returns the same tier, and the reasoning can be read straight off the code.
The question wording is based on the WHO's listed early warning signs of
cervical cancer (abnormal / intermenstrual / post-coital / post-menopausal
bleeding, unusual discharge, pelvic pain, pain during intercourse).

Question and tier text carries an English and a Kiswahili version
(`text`/`text_sw`, `label`/`label_sw`, `guidance`/`guidance_sw`) since this
content is fixed and shipped with the app rather than admin-editable, unlike
FAQItem/MythFact. The scoring logic itself only ever looks at question
`key`s, never the wording, so it is language-independent.
"""

# Order here IS the order the patient is asked.
QUESTIONS = [
    {
        "key": "irregular_bleeding",
        "text": "In the last few weeks, have you had bleeding between periods, "
                "or periods that are much heavier or longer than normal for you?",
        "text_sw": "Katika wiki chache zilizopita, umepata damu kati ya hedhi, "
                   "au hedhi nzito zaidi au ya muda mrefu zaidi kuliko kawaida yako?",
        "short_label": "irregular bleeding",
        "short_label_sw": "damu isiyo ya kawaida",
    },
    {
        "key": "postcoital_bleeding",
        "text": "Have you had vaginal bleeding during or after sex?",
        "text_sw": "Umepata damu ya ukeni wakati wa au baada ya kujamiiana?",
        "short_label": "bleeding after sex",
        "short_label_sw": "damu baada ya kujamiiana",
    },
    {
        "key": "postmenopausal_bleeding",
        "text": "If you have already been through menopause: have you had any "
                "vaginal bleeding since your periods stopped?",
        "text_sw": "Kama tayari umepitia kukoma hedhi: je, umepata damu yoyote ya "
                   "ukeni tangu hedhi zako zilipokoma?",
        "short_label": "post-menopausal bleeding",
        "short_label_sw": "damu baada ya kukoma hedhi",
    },
    {
        "key": "unusual_discharge",
        "text": "Have you noticed vaginal discharge that is new for you - watery, "
                "blood-stained, or foul-smelling?",
        "text_sw": "Umegundua majimaji ya ukeni ambayo ni tofauti na kawaida yako, "
                   "yenye maji mengi, yenye damu, au yenye harufu mbaya?",
        "short_label": "unusual discharge",
        "short_label_sw": "majimaji yasiyo ya kawaida",
    },
    {
        "key": "pelvic_pain",
        "text": "Have you had persistent pelvic pain or lower-back pain that is "
                "not part of your normal period?",
        "text_sw": "Umepata maumivu ya nyonga au sehemu ya chini ya mgongo "
                   "yanayoendelea ambayo si sehemu ya hedhi yako ya kawaida?",
        "short_label": "pelvic/back pain",
        "short_label_sw": "maumivu ya nyonga/mgongo",
    },
    {
        "key": "pain_intercourse",
        "text": "Have you had pain during intercourse that is new or getting worse?",
        "text_sw": "Umepata maumivu wakati wa kujamiiana ambayo ni mapya au yanazidi kuwa mabaya?",
        "short_label": "pain during intercourse",
        "short_label_sw": "maumivu wakati wa kujamiiana",
    },
]

QUESTION_KEYS = [q["key"] for q in QUESTIONS]
QUESTION_TEXT = {q["key"]: q["text"] for q in QUESTIONS}

# Bleeding-pattern answers carry more weight than pain/discharge alone.
RED_FLAG_KEYS = {
    "irregular_bleeding",
    "postcoital_bleeding",
    "postmenopausal_bleeding",
}

TIERS = {
    "ROUTINE": {
        "label": "Routine",
        "label_sw": "Kawaida",
        "guidance": "Nothing you reported points to a warning sign. Keep up with "
                    "routine cervical screening on the schedule your health "
                    "provider recommends.",
        "guidance_sw": "Hakuna ulichoripoti kinachoonyesha dalili ya hatari. Endelea "
                       "na uchunguzi wa kawaida wa shingo ya kizazi kulingana na "
                       "ratiba anayopendekeza mtoa huduma wako wa afya.",
    },
    "DISCUSS": {
        "label": "Discuss at your next visit",
        "label_sw": "Jadili katika ziara yako ijayo",
        "guidance": "You reported a symptom worth raising with a health worker. "
                    "It is very often something minor, but mention it at your "
                    "next visit or screening appointment.",
        "guidance_sw": "Umeripoti dalili inayofaa kujadiliwa na mhudumu wa afya. "
                       "Mara nyingi huwa si jambo kubwa, lakini itaje katika ziara "
                       "yako ijayo au miadi ya uchunguzi.",
    },
    "SEEK_CARE": {
        "label": "Seek care soon",
        "label_sw": "Tafuta huduma hivi karibuni",
        "guidance": "The combination you reported can be an early warning sign of "
                    "cervical disease. Please arrange to see a health worker or "
                    "visit a screening centre within the next week or two. "
                    "This is not a diagnosis.",
        "guidance_sw": "Mchanganyiko ulioripoti unaweza kuwa dalili ya awali ya "
                       "ugonjwa wa shingo ya kizazi. Tafadhali panga kuonana na "
                       "mhudumu wa afya au tembelea kituo cha uchunguzi ndani ya "
                       "wiki moja au mbili zijazo. Huu si utambuzi wa ugonjwa.",
    },
}

TIER_CHOICES = [(key, value["label"]) for key, value in TIERS.items()]


def _yes_keys(answers):
    """Normalise the submitted answers dict to a set of 'yes' question keys."""
    if not isinstance(answers, dict):
        return set()
    yes = set()
    for key in QUESTION_KEYS:
        value = answers.get(key)
        if value is True or (isinstance(value, str) and value.strip().lower() == "yes"):
            yes.add(key)
    return yes


def score(answers):
    """
    Map a set of yes/no answers to one of ROUTINE / DISCUSS / SEEK_CARE.

    Rules, checked in order:
      1. Any post-menopausal bleeding            -> SEEK_CARE
      2. Bleeding after sex PLUS >=1 other 'yes' -> SEEK_CARE
      3. Three or more symptoms of any kind      -> SEEK_CARE
      4. Any single bleeding-pattern red flag    -> DISCUSS
      5. One or two non-red-flag symptoms        -> DISCUSS
      6. Nothing reported                        -> ROUTINE
    """
    yes = _yes_keys(answers)
    total = len(yes)
    red = yes & RED_FLAG_KEYS

    if "postmenopausal_bleeding" in yes:
        return "SEEK_CARE"
    if "postcoital_bleeding" in yes and total >= 2:
        return "SEEK_CARE"
    if total >= 3:
        return "SEEK_CARE"
    if red:
        return "DISCUSS"
    if total >= 1:
        return "DISCUSS"
    return "ROUTINE"


SHORT_LABELS = {q["key"]: q["short_label"] for q in QUESTIONS}


def summary(answers):
    """
    Short human-readable string stored on SymptomLog.symptoms for the log
    list. Always English - it's a stored, point-in-time snapshot, not
    live UI text. The Dashboard rebuilds a Kiswahili version for display by
    re-deriving it from `answers` + the bilingual QUESTIONS list instead of
    reading this field, so it never needs to be re-translated after the fact.
    """
    yes = _yes_keys(answers)
    if not yes:
        return "No warning-sign symptoms reported"
    return ", ".join(SHORT_LABELS[k] for k in QUESTION_KEYS if k in yes)
