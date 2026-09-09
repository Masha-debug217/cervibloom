# CerviBloom Backend (Django + DRF)

## What this is
Role-based REST API for CerviBloom: Patient / Volunteer / Admin accounts,
JWT authentication, screening facility directory, symptom logs, screening
reminders, volunteer applications, and simulated donations.

## Requirements
- **Python 3.12 or newer.** This is a hard requirement: `requirements.txt`
  pins `Django==6.0.7`, and Django 6.0 refuses to install on Python 3.11 or
  earlier (`ERROR: No matching distribution found for Django==6.0.7`). If you
  must run on Python 3.11, change the pin to `Django>=5.2,<6`. The code uses
  no 6.0-only APIs.
- Node 18+ for the separate React frontend (see `../frontend`).

## Setup (first time)
```bash
# macOS / Linux
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/python manage.py migrate
./venv/bin/python manage.py seed_data        # loads real facilities + starter FAQs
./venv/bin/python manage.py createsuperuser   # creates an Admin login for /admin/
./venv/bin/python manage.py runserver
```
```powershell
# Windows (PowerShell) - use the py launcher to guarantee Python 3.12+
py -3.13 -m venv venv
.\venv\Scripts\python -m pip install -r requirements.txt
.\venv\Scripts\python manage.py migrate
.\venv\Scripts\python manage.py seed_data
.\venv\Scripts\python manage.py createsuperuser
.\venv\Scripts\python manage.py runserver
```

Server runs at http://127.0.0.1:8000/

## Key endpoints
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/register/` | POST | Create a Patient or Volunteer account (role=ADMIN is rejected) |
| `/api/auth/login/` | POST | Get JWT access+refresh tokens |
| `/api/auth/login/refresh/` | POST | Exchange a refresh token for a new access token |
| `/api/auth/me/` | GET | Current logged-in user's profile |
| `/api/facilities/` | GET (public) / POST | Screening directory + stock status (write = Admin only) |
| `/api/faqs/` | GET (public) / POST | Info Hub content (write = Admin only) |
| `/api/faqs/search/?q=` | GET (public) | Rule-based keyword search over FAQ content, no LLM |
| `/api/myths/` | GET (public) / POST | Myth-vs-fact cards (write = Admin only) |
| `/api/symptom-logs/` | GET/POST | Patient's own Symptom Navigator entries; risk tier computed server-side |
| `/api/symptom-logs/questions/` | GET | The fixed Navigator question set + tier copy |
| `/api/screening-reminders/` | GET / POST / PUT | Patient reads own; Admin reads all and writes |
| `/api/volunteer-applications/` | GET/POST | VOLUNTEER creates own; Admin sees all |
| `/api/volunteer-applications/{id}/status/` | PATCH | Admin-only: set PENDING/CONTACTED/ACCEPTED |
| `/api/donations/` | GET/POST | Simulated donations (amount + anonymous flag); donor sees own history |
| `/admin/` | - | Django admin panel (use createsuperuser above) |

## Why key decisions were made
- **Custom User model** (`accounts/models.py`): needed a `role` field from day
  one since Patient/Volunteer/Admin see fundamentally different data.
- **JWT not sessions**: frontend (React) and backend (Django) are separate
  apps talking over HTTP, so token-based auth is the standard pattern.
- **Permissions enforced in `get_queryset()`**, not just hidden UI buttons -
  e.g. a Patient's symptom logs are filtered server-side to their own user,
  so even a modified frontend can't see someone else's health data.
- **SQLite for local dev only** - swap to Postgres before deploying (most
  free hosts wipe SQLite's file on every restart).

## Next steps for deployment
1. Set `DEBUG = False` and add your real domain to `ALLOWED_HOSTS` in settings.py
2. Swap SQLite for Postgres (e.g. Render's free Postgres)
3. Set `CORS_ALLOWED_ORIGINS` to your real deployed frontend URL
4. Move `SECRET_KEY` to an environment variable
