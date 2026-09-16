"""
Computes a signed-in user's current notifications on demand.

There's no email, SMS, or push infrastructure in this project (that would
need a real provider account, matching the same "don't fabricate a real-
world capability" line drawn for PayHero and event reminders elsewhere in
this app). So this isn't a queue of things that were "sent" - it's a live
read of data that already exists (appointment status, an admin-set
screening reminder, upcoming RSVPed events, self-reported vaccine doses),
recomputed every time the notifications endpoint is called.
"""
from datetime import timedelta
from django.utils import timezone

from .models import AppointmentRequest, EventRSVP, ScreeningReminder

APPOINTMENT_STATUS_LABEL = {
    AppointmentRequest.Status.CONFIRMED: 'confirmed',
    AppointmentRequest.Status.DECLINED: 'declined',
    AppointmentRequest.Status.COMPLETED: 'marked completed',
}


def build_notifications(user):
    items = []
    today = timezone.localdate()
    now = timezone.now()

    reminder = ScreeningReminder.objects.filter(patient=user).first()
    if reminder and reminder.next_due_date <= today + timedelta(days=30):
        overdue = reminder.next_due_date < today
        items.append({
            'key': f'screening_reminder_{reminder.id}',
            'category': 'SCREENING',
            'title': 'Screening overdue' if overdue else 'Screening due soon',
            'body': reminder.guidance_note or f'Your recommended screening date is {reminder.next_due_date}.',
            'date': reminder.next_due_date.isoformat(),
        })

    appointments = (
        AppointmentRequest.objects
        .filter(patient=user)
        .exclude(status=AppointmentRequest.Status.PENDING)
        .select_related('facility')
    )
    for appt in appointments:
        label = APPOINTMENT_STATUS_LABEL.get(appt.status, appt.status.lower())
        items.append({
            'key': f'appointment_{appt.id}_{appt.status}',
            'category': 'APPOINTMENT',
            'title': f'Appointment request {label}',
            'body': appt.admin_note or f'Your request to {appt.facility.name} was {label}.',
            'date': appt.preferred_date.isoformat(),
        })

    upcoming_cutoff = now + timedelta(days=7)
    upcoming_rsvps = (
        EventRSVP.objects
        .filter(user=user, event__start_date__gte=now, event__start_date__lte=upcoming_cutoff)
        .select_related('event')
    )
    for rsvp in upcoming_rsvps:
        event = rsvp.event
        items.append({
            'key': f'event_{event.id}_{event.start_date.date()}',
            'category': 'EVENT',
            'title': 'Upcoming event',
            'body': f"{event.title} is coming up on {event.start_date.strftime('%b %d')}.",
            'date': event.start_date.date().isoformat(),
        })

    if user.hpv_vaccine_doses == '1':
        items.append({
            'key': 'hpv_second_dose_nudge',
            'category': 'VACCINE',
            'title': 'Complete your HPV vaccination',
            'body': 'Your profile shows 1 HPV vaccine dose. A second dose completes the recommended series.',
            'date': None,
        })

    items.sort(key=lambda n: n['date'] or '9999-99-99')
    return items
