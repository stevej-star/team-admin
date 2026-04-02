# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Run the full stack (recommended)
```bash
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432 (user: `team`, db: `team`)

### Run without Docker

**Backend:**
```bash
cd backend
npm install
DATABASE_URL=postgres://team:team@localhost:5432/team npm start
# or for auto-reload:
DATABASE_URL=postgres://team:team@localhost:5432/team npx nodemon src/index.js
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

There are no lint or test scripts configured in either package.json.

## Architecture

### Split responsibilities: localStorage vs PostgreSQL

All user preferences and app settings live exclusively in **localStorage** (never sent to the backend). Persistent data (team members, projects, tasks, release TAs, notes) lives in **PostgreSQL** via the REST API.

- `AppSettingsContext` (`frontend/src/context/AppSettingsContext.jsx`) is the single source of truth for all localStorage state: app name, theme, logo, PIN, feature flags, user profile, and onboarding status. Consume it via `useAppSettings()`.

### Feature flags

The `enabledFeatures` array in `AppSettingsContext` controls which modules are active (`'tasks'`, `'projects'`, `'team'`, `'releases'`, `'notes'`). `Sidebar.jsx` filters nav links based on this. Pages themselves do not enforce feature checks — the sidebar is the gate.

### Schema migrations

`backend/src/migrate.js` runs `schema.sql` on every startup. New columns must be added as idempotent `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements at the bottom of `schema.sql` — never modify existing `CREATE TABLE` blocks to add columns (they only run on first creation).

### Routing

`App.jsx` renders `<Onboarding />` until `onboardingComplete` is set in localStorage. After that, `AppShell` renders the sidebar + `<Routes>`. Team routes (`/team`, `/team/:id`) are wrapped in `<PinGate>` for optional PIN protection.

### Backend route pattern

All routes follow standard Express REST (GET list, GET /:id, POST, PUT /:id, DELETE /:id) using the `pg` pool from `db.js`. The notes route also has sub-resources at `/api/notes/folders`.

### Adding a new feature/module

1. Add the feature key to `ALL_FEATURES` in `AppSettingsContext.jsx`
2. Create the backend route file in `backend/src/routes/` and mount it in `backend/src/index.js`
3. Add any new tables to `schema.sql` (new tables as `CREATE TABLE IF NOT EXISTS`, new columns as `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`)
4. Create the page component in `frontend/src/pages/` and add the route in `App.jsx`
5. Add the nav link to `Sidebar.jsx` gated by `enabledFeatures.includes('your-feature')`
