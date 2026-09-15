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
Community posting things such as events, Call to actions for volunteering, volunteer badge, posting certificates.

### Profile Page
Users

### Notifications (Feature)
Notifications for screening appointments, dosage taking, vaccine follow ups, event dates.

### Admin Dashboard
Review volunteers, Donations overview, etc
