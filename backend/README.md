# CerviBloom Backend (Django + DRF)

## What this is
Role-based REST API for CerviBloom: Patient / Volunteer / Admin accounts,
JWT authentication, screening facility directory, symptom logs, screening
reminders, volunteer applications, and simulated donations.

## Setup (first time)
```bash
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/python manage.py migrate
./venv/bin/python manage.py createsuperuser   # creates an Admin login for /admin/
./venv/bin/python manage.py runserver
```

Server runs at http://127.0.0.1:8000/

## Key endpoints
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/register/` | POST | Create account (any role) |
| `/api/auth/login/` | POST | Get JWT access+refresh tokens |
| `/api/auth/me/` | GET | Current logged-in user's profile |
| `/api/facilities/` | GET/POST | Screening directory (write = Admin only) |
| `/api/faqs/` | GET/POST | Info Hub content (write = Admin only) |
| `/api/symptom-logs/` | GET/POST | Patient's own symptom entries only |
| `/api/screening-reminders/` | GET | Patient's own reminder |
| `/api/volunteer-applications/` | GET/POST | Volunteer's own applications (Admin sees all) |
| `/api/donations/` | GET/POST | Simulated donations only - no real payment |
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
