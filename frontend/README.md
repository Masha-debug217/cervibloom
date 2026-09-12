# CerviBloom Frontend (React + Vite)

## Setup (first time)
```bash
npm install
npm run dev
```
Opens at http://localhost:5173/. Run the Django backend at
http://127.0.0.1:8000/ at the same time (see backend/README.md), or the
API calls will fail.

## Structure
- `src/api/client.js` is the Axios instance every page uses to talk to
  Django. Change `API_BASE` here when you deploy.
- `src/context/AuthContext.jsx` handles login, register, and logout, and
  tracks who is currently signed in via a JWT stored in localStorage.
- `src/pages/` has one file per page: Home, InfoHub, Directory, Dashboard,
  VolunteerDonate, Admin, Auth, and the static About/Contact/Terms/Privacy pages.
- `src/theme.css` is the whole design system: colors, light and dark mode,
  and component styles carried over from the original prototype.
- `src/App.jsx` holds the routing. Dashboard and Volunteer & Donate require
  a logged-in user, and the Admin console also requires an admin account.
  Anyone not signed in is sent to `/auth`.

## Pre-launch checklist
1. Run the backend's `seed_data` command so the directory/FAQ aren't empty
2. Register a test account through the sign-up form. Every signed-up
   account is a User and can use the Symptom Navigator, Dashboard, and
   Volunteer & Donate pages. There is no role to choose.
3. Create the Admin account from the backend with
   `python manage.py createsuperuser`. The sign-up form cannot create an
   Admin; open registration only makes User accounts.
4. `npm run build` to confirm it still compiles cleanly (already tested here - it does)
