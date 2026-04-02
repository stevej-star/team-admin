# Team Manager

A configurable local-first web tool for engineering teams — manage projects, people, tasks, and releases with a structured technical approval workflow. Built for simple local use, with per-user setup and optional feature selection.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL 16 |
| Infrastructure | Docker Compose |

## Getting started

```bash
docker compose up --build
```

Then open **http://localhost:5173** in your browser. On first load you'll be guided through a short setup wizard.

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| PostgreSQL | localhost:5432 (user: `team`, db: `team`) |

## Development (without Docker)

### Backend
```bash
cd backend
npm install
DATABASE_URL=postgres://team:team@localhost:5432/team npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## First-time setup wizard

On first open, a 4-step wizard walks you through:

1. **Your profile** — name (required) and job title/role
2. **Branding** — custom app name and logo upload
3. **Features** — choose which modules to enable

If Team Management is selected and a name is provided, you are automatically added as a team member. All settings are stored in `localStorage` — nothing leaves the browser.

---

## Features

### 🏠 Dashboard
- Summary cards: active projects, team members, open tasks (all clickable)
- Recent projects with status badges
- Open & overdue tasks with colour-coded due date chips

### 📁 Projects
- Create and filter projects by status (Active / On Hold / Completed)
- Per-project: description, notes, status, external links, team assignments, related tasks
- **External links** — Jira, Confluence, Atlas, Slack (with deep-link conversion), or any custom URL
- **Team assignment** — hidden when Team Management feature is disabled

### 👥 Team Management *(optional feature)*
- Team member profiles: name, role, email, avatar, notes
- View projects each member is assigned to
- **PIN protection** — optional 4-digit PIN on the Team tab with configurable inactivity timeout (1–30 min)

### ✅ My Tasks *(optional feature)*
- Kanban board: To Do / In Progress / Done
- Filter by project
- Due date chips: 🔴 overdue · 🟠 today · 🟡 soon · ⚫ future
- Link tasks to projects

### 🚀 Release TA *(optional feature)*
- Structured release technical approval workflow
- **Sections** (each with inline line editor):
  - Demo Consistency — start/end time picker with auto-generated sentence
  - Database Migrations, Config, Java Connector, Java Common, Foundation, Generated Source Code, Java Server, Build Logic
- **Decisions** section with sub-fields: Safety of Release, Rollback, Critical Path Impact, Exceptions & Alerts, Pipeline
- **Tech Approval** — green approve checkbox + red reject button (rejection requires a written reason)
- **Status workflow**: Pending → Approved / Rejected (auto-updated on approval/rejection)
- **Structured line editor** for each section:
  - Service dropdown (searchable, multi-select, supports custom values)
  - Detail text field
  - Lines auto-sort alphabetically by service
  - Add line saves immediately; remove line saves immediately
- **Live markdown export** panel — raw markdown in original template format, with Copy and `.md` download
- Release date and demo times default to today on new records

### ⚙️ Settings
- **Your profile** — edit name and role
- **App name** — rename the app (e.g. "Blue Team")
- **Logo** — upload a logo; displayed in the sidebar and set as favicon
- **Theme** — 7 built-in themes:

| Theme | Description |
|---|---|
| Default | Classic blue & grey |
| Modern Sleek | Deep navy, indigo accents |
| Techy | Full dark mode, cyan accents |
| Minimalist | Clean black & white |
| Sunset | Warm amber tones |
| Forest | Earthy greens |
| Notepad | Lined paper, handwritten Caveat font |

- **Features** — toggle modules on/off at any time (at least one must remain enabled)
- **Team privacy** — set / change / remove PIN, configure inactivity lock timeout
- **Setup wizard** — re-run first-time setup from scratch

---

## Architecture

### Frontend (`frontend/src/`)

```
pages/
  Dashboard.jsx         Home overview with metrics
  Projects.jsx          Project list with filter tabs
  ProjectDetail.jsx     Single project editor + relationships
  TeamMembers.jsx       Team member grid (PIN gated)
  MemberDetail.jsx      Member profile editor (PIN gated)
  Tasks.jsx             Kanban task board
  ReleaseTAs.jsx        Release TA list
  ReleaseTADetail.jsx   Full release TA editor + export panel
  Settings.jsx          All app settings
  Onboarding.jsx        First-time setup wizard

components/
  Sidebar.jsx           Nav bar — filters links by enabled features
  PinGate.jsx           PIN lock screen wrapper
  DueDateChip.jsx       Colour-coded due date badge
  StatusBadge.jsx       Project/release status pill
  LinkBadge.jsx         External resource link badge
  Modal.jsx             Generic modal dialog

context/
  AppSettingsContext.jsx  Global settings state — all persisted to localStorage
```

### Backend (`backend/src/`)

```
routes/
  members.js            GET/POST/PUT/DELETE /api/members
  projects.js           GET/POST/PUT/DELETE /api/projects (+ /links, /members)
  tasks.js              GET/POST/PUT/DELETE /api/tasks
  release-tas.js        GET/POST/PUT/DELETE /api/release-tas
index.js                Express app, CORS, route mounting, migration on start
db.js                   PostgreSQL pool (pg)
migrate.js              Runs schema.sql on startup
schema.sql              Table definitions + idempotent ALTER TABLE migrations
```

### Database tables

| Table | Purpose |
|---|---|
| `team_members` | name, role, email, avatar_url, notes |
| `projects` | name, description, status, notes |
| `project_links` | label + url per project (cascades on project delete) |
| `project_members` | junction: project ↔ member |
| `tasks` | title, description, status, project_id, due_date |
| `release_tas` | full release TA record (20+ columns covering all sections, decisions, timestamps) |

---

## localStorage keys

All frontend settings are stored client-side. Nothing is sent to the backend except team member creation during onboarding.

| Key | Value |
|---|---|
| `appName` | Custom app name string |
| `appTheme` | Active theme ID |
| `appLogo` | Base64 PNG (max 128px) |
| `onboardingComplete` | `"true"` once wizard is finished |
| `enabledFeatures` | JSON array e.g. `["tasks","releases"]` |
| `userProfile` | JSON `{name, role}` |
| `teamPin` | 4-digit string or absent |
| `pinTimeout` | Inactivity timeout in minutes |
