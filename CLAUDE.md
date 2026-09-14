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

The brand palette (plum `#7A1F3D` primary, rose-pink `#E85D8A` in dark
mode, Poppins for headings, Inter for body) is fixed. As of the Tailwind
migration, the system is mid-transition between two layers:

- `frontend/src/styles/globals.css` is the source of truth for color
  tokens (`--primary`, `--background`, `--foreground`, `--card`,
  `--secondary`, `--muted`, `--accent`, `--border`, plus `success`/
  `warning`/`info`/`blush`/`rose-pink`) and Tailwind's own utility
  layer, including shared classes like `.btn-primary`, `.btn-outline`,
  `.card-base`, `.container-base`, `.section-padding`, `.nav-link`. Dark
  mode is the `.dark` class on `<html>`, toggled and persisted by
  `frontend/src/App.jsx`. New or redesigned pages should be built with
  Tailwind utility classes against these tokens, matching the structure
  of `frontend/src/components/home/*.jsx`.
- `frontend/src/theme.css` holds the older hand-written component classes
  (`.panel`, `.tag`, `.faq-item`, `.facility-card`, `.form-card`, etc.)
  still used by pages that haven't been redesigned yet. It aliases the
  old variable names (`--bg`, `--surface`, `--surface-alt`, `--text`,
  `--text-secondary`, `--primary-tint`) to the new tokens so those pages
  keep working unchanged. Don't add new colors here; when a page gets
  its Tailwind redesign, retire its old classes from this file instead
  of maintaining both.
- Reuse `lucide-react` for icons in new/redesigned components rather
  than emoji or a different icon set.
- Gotcha: `theme.css` still has a blanket
  `input[type=text], input[type=email], ...{padding:10px 12px; ...}`
  rule for old pages' plain `<input>`/`<textarea>` fields. Its element +
  attribute selector beats a same-specificity Tailwind utility class, so
  a new Tailwind `<input>`'s `px-*`/`py-*` padding gets silently
  overridden (this is how a search icon ended up sitting on top of the
  placeholder text). Prefix padding utilities on any new Tailwind input
  with `!` (e.g. `!pl-10 !pr-4 !py-3`) to force them to win.
- A sticky in-page sub-nav (like Info Hub's Topics/FAQ/Myths/Articles
  tab strip) needs `top-16` to sit below the site header, not `top-0`;
  the header is itself `sticky top-0` and exactly `h-16` tall, so two
  elements both pinned to `top-0` overlap instead of stacking.

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
