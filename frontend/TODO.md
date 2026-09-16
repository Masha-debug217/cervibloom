# TODO

## Claude
Done: CLAUDE.md added at the repo root with the project's architecture, conventions, and definition of done.

### HomePage
Done: added a features overview, a "How it works" section, and a closing
call-to-action to the homepage.

### AUTH
Done: collapsed Patient/Volunteer/Admin down to two roles, User and Admin.
Every signed-up account is a User and can use the Symptom Navigator,
Dashboard, and Volunteer & Donate pages without picking a role at sign-up.
Admin is still created only via `manage.py createsuperuser`.

### Core Pages
Done: added About Us, Contact Us, Terms & Conditions, and Privacy Policy
pages, linked from the footer on every page.

### Core features
Done: added English/Kiswahili support. Static UI text switches via a nav
toggle; FAQs, myths, and facility services carry an optional Kiswahili
translation editable in the Admin console, falling back to English when
blank.

### InfoHub
Done: redesigned with Tailwind (health topics accordion, FAQ accordion,
a 3D flip-card Myths vs Facts grid, a keyword search, and an Articles
CTA), matching the Home page's new visual system. FAQ and myth content
still comes from the backend and stays admin-editable; only the topics
are fixed shipped content, matching the Symptom Navigator's pattern.

### Articles
Done: added a bilingual Articles page under the Info Hub, seeded with four
science articles on HPV and cervical cancer. Signed-in users can bookmark
articles and view them in a separate Saved tab; admins manage articles the
same way as FAQs and myths.

### Survivers Blog
Done: added a Survivor Blog page. Any signed-in user can submit a story,
which starts out pending and only appears publicly once an admin
publishes it from the new Blog tab in the Admin console; a submitter can
track their own story's status under "Share your story".

### Symptom navigator
Done: already built on the Dashboard as a deterministic, rule-based
questionnaire (see `backend/core/symptom_navigator.py`), not AI. It walks
through the WHO-listed warning signs, computes a risk tier (routine /
discuss / seek care) server-side, and for "seek care" points to the
nearest facility in the Screening Directory. Kept rule-based rather than
LLM-based on purpose: a real diagnosis-adjacent feature giving actual
users health guidance needs to be transparent and reproducible, not a
model that can hallucinate.

### Donations
Done: built as part of Get Involved (`/get-involved`). Ranked top 10
leaderboard, public/anonymous giving, no account required, any amount
accepted (no minimum). Payment is simulated, clearly labeled as such;
PayHero/M-Pesa isn't connected yet since that needs a real PayHero
business account and till/paybill number, not something to fabricate.
The "5% maintenance fee" and specific recipient orgs from the original
idea aren't shown, since no real payment relationship exists to route
funds through yet.

### Volunteer
Done: built as part of Get Involved. Six fixed roles (three medical,
three community/outreach) with license/background requirements shown up
front, a sign-in-gated application form, and a status tracker
(Submitted → Approved → Active → Completed).

#### Volunteer certificates
Done: real printable certificate (browser print-to-PDF) for completed
applications, plus badges computed live from a volunteer's own real
application history (not pre-awarded to anyone).

### Events
Done: admin-created events (`/events`), public listing with upcoming/past
filter, sign-in-gated RSVP ("I'm Going"), and optional volunteer roles an
event needs, shown as badges linking back to the real Get Involved
application flow rather than a separate booking system. No events are
seeded; an empty list says so honestly rather than showing invented ones.

### Screening Centers
Done: built earlier as the Screening Directory (`/directory`), with
real facility data, county/service filters, and Get Directions links.

### Appointments
Done: a "Request a Screening Visit" flow from any facility card in the
Screening Directory (preferred date/time, reason), tracked as a real
request an admin confirms or declines with a note, shown on the
Dashboard. Deliberately not called "booking": no hospital scheduling
system is integrated, so the UI says clearly this is a request the
facility still needs to confirm by phone, not a guaranteed slot. Hours/
availability info uses the Facility model's existing open_days/
open_hours fields. No reminder notifications, since there's no email/SMS
infrastructure to send them.

### Community
Dropped. Researched how real cancer/health nonprofits handle this (American
Cancer Society's volunteer hub, Cervivor's survivor community): none of them
run an open user-post social feed on their own site. They publish curated,
org-written content (volunteer spotlights, an events calendar, story
archives) and point people to established platforms like Facebook or
Instagram for actual back-and-forth social interaction, rather than
building and moderating their own feed. An open feed on a health platform
also means moderating unvetted posts in a space people may bring symptoms
or diagnoses into, which is a real liability this project isn't set up to
carry. Everything the original idea asked for already exists in a more
appropriate form: events (`/events`), volunteering call-to-action and
badges (`/get-involved`), and printable certificates (Dashboard). Nothing
new needed here.

### Profile Page
Done: added `/profile`, reachable from a person icon in the nav next to
the theme toggle (and from the mobile menu). Researched how health apps
and volunteer platforms handle this first: edit the essentials in place,
keep sensitive fields clearly marked as self-reported and private, and
require the current password to change it. Lets a signed-in user view and
edit the account fields collected at signup (name, email, phone, county,
date of birth), their self-reported health profile (last screening year,
HPV vaccine doses), and preferred language, plus change their password
(requires the current one first). Username and role stay fixed here,
since they're not meant to change through self-service.

### Notifications (Feature)
Done: added an in-app notification bell in the nav, not email/SMS/push,
since none of that infrastructure exists (same reasoning as PayHero:
those need a real provider account, not something to fabricate).
Notifications are computed live every time the bell is opened, from data
that already exists: an appointment request's status change (confirmed,
declined, completed, with the admin's note), an admin-set screening
reminder due within 30 days, an RSVPed event happening within 7 days, and
a one-time nudge for anyone who self-reported exactly 1 HPV vaccine dose
to get their second. Dismissing one persists (a small `NotificationDismissal`
row) so it doesn't reappear. Nothing is invented: a user with no confirmed
appointments, no admin-set reminder, no RSVPs, and 0 or 2+ vaccine doses
simply sees "You're all caught up."

### Admin Dashboard
Done: added an Overview tab as the Admin console's new default landing
tab. Every other tab was already a raw CRUD table with no totals, and
donations had no admin visibility at all (the leaderboard only existed on
the public Get Involved page) - Overview pulls together real counts from
the same endpoints the other tabs already call: total amount raised and
donation count, volunteer applications and appointment requests by
status, stories awaiting review, upcoming events, and total facilities.
No new backend endpoints or packages: every admin viewset already returns
the full list to an ADMIN, so the counts are computed client-side from
data already being fetched elsewhere in the console. Built with the same
legacy `theme.css` classes as the rest of Admin.jsx rather than Tailwind,
since redesigning one tab in the new system while the other eight stay
old would look inconsistent inside a single tab-switcher; a full
Tailwind redesign of the Admin console is separate future work if wanted.
