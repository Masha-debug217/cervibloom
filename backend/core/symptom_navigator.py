"""
The Symptom Navigator question set and its scoring rule.

This is deliberately a small, transparent, DETERMINISTIC rule set - not a
model, not a fabricated "percentage risk". Given the same answers it always
returns the same tier, and the reasoning can be read straight off the code.
The question wording is based on the WHO's listed early warning signs of
cervical cancer (abnormal / intermenstrual / post-coital / post-menopausal
bleeding, unusual discharge, pelvic pain, pain during intercourse).
"""

# Order here IS the order the patient is asked.
QUESTIONS = [
    {
        "key": "irregular_bleeding",
        "text": "In the last few weeks, have you had bleeding between periods, "
                "or periods that are much heavier or longer than normal for you?",
    },
    {
        "key": "postcoital_bleeding",
        "text": "Have you had vaginal bleeding during or after sex?",
    },
    {
        "key": "postmenopausal_bleeding",
        "text": "If you have already been through menopause: have you had any "
                "vaginal bleeding since your periods stopped?",
    },
    {
        "key": "unusual_discharge",
        "text": "Have you noticed vaginal discharge that is new for you - watery, "
                "blood-stained, or foul-smelling?",
    },
    {
        "key": "pelvic_pain",
        "text": "Have you had persistent pelvic pain or lower-back pain that is "
                "not part of your normal period?",
    },
    {
        "key": "pain_intercourse",
        "text": "Have you had pain during intercourse that is new or getting worse?",
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
        "guidance": "Nothing you reported points to a warning sign. Keep up with "
                    "routine cervical screening on the schedule your health "
                    "provider recommends.",
    },
    "DISCUSS": {
        "label": "Discuss at your next visit",
        "guidance": "You reported a symptom worth raising with a health worker. "
                    "It is very often something minor, but mention it at your "
                    "next visit or screening appointment.",
    },
    "SEEK_CARE": {
        "label": "Seek care soon",
        "guidance": "The combination you reported can be an early warning sign of "
                    "cervical disease. Please arrange to see a health worker or "
                    "visit a screening centre within the next week or two. "
                    "This is not a diagnosis.",
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


def summary(answers):
    """Short human-readable string stored on SymptomLog.symptoms for the log list."""
    yes = _yes_keys(answers)
    if not yes:
        return "No warning-sign symptoms reported"
    labels = {
        "irregular_bleeding": "irregular bleeding",
        "postcoital_bleeding": "bleeding after sex",
        "postmenopausal_bleeding": "post-menopausal bleeding",
        "unusual_discharge": "unusual discharge",
        "pelvic_pain": "pelvic/back pain",
        "pain_intercourse": "pain during intercourse",
    }
    return ", ".join(labels[k] for k in QUESTION_KEYS if k in yes)
