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
  VolunteerDonate, Admin, and Auth.
- `src/theme.css` is the whole design system: colors, light and dark mode,
  and component styles carried over from the original prototype.
- `src/App.jsx` holds the routing. Dashboard and Volunteer & Donate require
  a logged-in user, and the Admin console also requires an admin account.
  Anyone not signed in is sent to `/auth`.

## Before your defense
1. Run the backend's `seed_data` command so the directory/FAQ aren't empty
2. Register a test Patient, Volunteer, and Admin account so you can
   demo all three roles
3. `npm run build` to confirm it still compiles cleanly (already tested here - it does)
