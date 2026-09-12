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
Done: added an "Understanding Cervical Cancer" section (what it is, causes,
prevention, signs, treatment) above the existing FAQ and Myth vs. Fact
sections, all bilingual.

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
Ranked top 10, using payhero, public/anonymous, donations going to cancer organization like National Cancer Institute Kenya, CureCervicalCancer, 5% maintainance fee. 
Impact Notes for your donations.

### Volunteer
People can sign up to vounteer for community service in charity events ie Medical and non-medical volunteer.

#### Volunteer certificates
Downloadable after volunteering. and badges

### Events
Showcasing cervical cancer events and booking, adding the voluntering to the event, 

### Screening Centers
Screening centers near you, directions.

### Appointments
Booking appointments to hospitals, showing info like hours availability etc, reminder notifications.

### Community
Community posting things such as events, Call to actions for volunteering, volunteer badge, posting certificates.

### Profile Page
Users

### Notifications (Feature)
Notifications for screening appointments, dosage taking, vaccine follow ups, event dates.

### Admin Dashboard
Review volunteers, Donations overview, etc