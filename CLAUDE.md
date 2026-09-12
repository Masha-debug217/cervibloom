# CerviBloom

Role-based cervical cancer awareness, screening, and volunteering platform.
Django REST Framework backend, React (Vite) frontend, JWT auth with two
roles: User (every signed-up account; covers symptom tracking, volunteering,
and donating) and Admin (created only via `createsuperuser`, manages
content and applications).

## Architecture

- `backend/` - Django project `cervibloom_backend`, split into apps:
  `accounts` (custom user model, auth, roles) and `core` (facilities, FAQs,
  myths, symptom navigator, donations, volunteering, everything else
  domain-specific). Add new domain features as a new app or inside `core`,
  not as one-off views bolted onto `accounts`.
- `frontend/` - React app, one file per route under `src/pages/`, a single
  Axios instance in `src/api/client.js`, auth state in
  `src/context/AuthContext.jsx`. Routing lives in `src/App.jsx`.
- Keep the frontend and backend end-to-end: a new feature means a model,
  a serializer, a permission class, a URL, and the page or component that
  calls it. Do not leave a feature half-wired on only one side.

## Before writing new code

- Search first. Reuse an existing component, hook, serializer, permission
  class, or utility before writing a new one. Match the naming and file
  layout already used in the app you're touching.
- Do not add a new npm or pip package unless the task genuinely needs it
  and nothing already in `requirements.txt` / `package.json` covers it.

## Design system

`frontend/src/theme.css` is the whole design system (plum primary, rose
tints, Poppins/Inter) and is frozen: it was built to match an existing
Figma design. Reuse its tokens and classes. Do not change colors, fonts,
icons, or overall visual style, and do not introduce a second styling
approach (CSS-in-JS, a different CSS framework, etc.) alongside it.

## Internationalization

The app ships in English and Kiswahili with no i18n library dependency.

- Static UI copy lives in `frontend/src/i18n/translations.js` as flat
  `{ en: {...}, sw: {...} }` dictionaries; components read it through the
  `t(key)` function from `useLanguage()` (`frontend/src/context/LanguageContext.jsx`).
  Add a new key to both languages, never just one.
- Admin-editable database content (`FAQItem`, `MythFact`, `Facility`)
  carries its own optional `_sw` fields (e.g. `question_sw`, `myth_sw`,
  `services_sw`) alongside the English ones, filled in through the Admin
  console. Frontend pages fall back to the English field when the Kiswahili
  one is blank; never require it.
- Fixed, non-admin-editable content that still needs both languages (the
  Symptom Navigator's questions and risk-tier copy in
  `backend/core/symptom_navigator.py`) follows the same `text`/`text_sw`
  pattern and is returned as-is via the API for the frontend to pick from.

## Secrets and configuration

- Never commit `.env` files, keys, tokens, or credentials. `.env` is
  gitignored everywhere; keep `.env.example` up to date with placeholder
  values only.
- Settings that vary by environment (`DJANGO_SECRET_KEY`, API base URLs,
  allowed hosts/CORS origins) load from the environment, with a clearly
  fake default for local dev only, never a real-looking one.

## Writing copy

Review any user-facing text (UI copy, error messages, docs) for genericness:
no corporate buzzwords, no filler adjectives, no leftover placeholder text.
Do not use em dashes anywhere (code, comments, docs, UI copy, commit
messages); write the sentence so it never needed one.

## Verification (definition of done)

A change is done only when, at minimum:
- `backend`: `manage.py test` and `manage.py check` pass.
- `frontend`: `npm run build` succeeds.
- The feature actually works end to end and existing functionality still
  works. For UI changes, run the dev server and click through the feature
  before calling it finished.

## Git

- Work on `main` directly; this is a solo project, do not create feature
  branches per task.
- Commit messages: `type(scope): description` (feat, fix, refactor, docs,
  test, chore, build). No vague messages like "update" or "fixed". Keep
  commits small and focused on one logical change.
- Before committing, confirm nothing unintended is staged, especially
  `.env` or `db.sqlite3`.
