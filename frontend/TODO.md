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
Information on Cervical Cancer, causes, prevention, treatment etc
FAQs
Q&A
Myths and Misconceptions and fact

### Articles
Science Articles on CC. Bookmarks.

### Survivers Blog
Survivers motivational blogs

### Symptom navigator
Interactive questioning symptom analyzer that navigates through some common sysmptoms and give a general diagnosis and advising to go to screening using AI.

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