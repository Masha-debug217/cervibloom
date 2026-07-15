# CerviBloom Frontend (React + Vite)

## Setup (first time)
```bash
npm install
npm run dev
```
Opens at http://localhost:5173/ — make sure the Django backend is running
at http://127.0.0.1:8000/ at the same time (see backend/README.md), otherwise
API calls will fail.

## Structure
- `src/api/client.js` — the Axios instance every page uses to talk to Django.
  Change `API_BASE` here when you deploy.
- `src/context/AuthContext.jsx` — handles login/register/logout and knows
  who's currently signed in (via JWT stored in localStorage).
- `src/pages/` — one file per page (Home, InfoHub, Directory, Dashboard,
  VolunteerDonate, Auth).
- `src/theme.css` — the whole design system (colors, light/dark mode,
  component styles) carried over from the original prototype.
- `src/App.jsx` — routing. Directory, Dashboard, and Volunteer&Donate are
  wrapped in `<ProtectedRoute>` — logged-out users get redirected to `/auth`.

## Before your defense
1. Run the backend's `seed_data` command so the directory/FAQ aren't empty
2. Register a test Patient, Volunteer, and Admin account so you can
   demo all three roles
3. `npm run build` to confirm it still compiles cleanly (already tested here - it does)
