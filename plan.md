# Team Management Tool — Implementation Plan

## Overview
A personal web-based tool to manage a team of engineers. Tracks projects, links to external tools (Jira, Confluence, Atlas), assigns engineers to projects, maintains team member profiles, and manages personal tasks/notes.

## Tech Stack
- **Frontend:** React (Vite) + React Router + Tailwind CSS
- **Backend:** Node.js + Express (REST API)
- **Database:** PostgreSQL
- **Infrastructure:** Docker Compose (frontend, backend, db as separate services)

## Data Model

### `team_members`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | TEXT | |
| role | TEXT | e.g. "Senior Engineer" |
| email | TEXT | |
| avatar_url | TEXT | optional |
| notes | TEXT | free-form personal notes |
| created_at | TIMESTAMP | |

### `projects`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | TEXT | |
| description | TEXT | |
| status | ENUM | 'active', 'on_hold', 'completed' |
| notes | TEXT | personal notes/updates |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `project_links`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| project_id | UUID | FK → projects |
| label | TEXT | e.g. "Jira", "Confluence", "Atlas", or custom |
| url | TEXT | |

### `project_members` (join table)
| Column | Type |
|--------|------|
| project_id | UUID |
| member_id | UUID |

### `tasks`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| title | TEXT | |
| description | TEXT | |
| status | ENUM | 'todo', 'in_progress', 'done' |
| project_id | UUID | nullable FK → projects |
| due_date | DATE | optional |
| created_at | TIMESTAMP | |

---

## Project Structure

```
team/
├── docker-compose.yml
├── plan.md
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx        # summary view
│       │   ├── Projects.jsx         # project list
│       │   ├── ProjectDetail.jsx    # single project + links + members
│       │   ├── TeamMembers.jsx      # member list
│       │   ├── MemberDetail.jsx     # single member profile
│       │   └── Tasks.jsx            # personal task list
│       └── components/
│           ├── Sidebar.jsx
│           ├── ProjectCard.jsx
│           ├── MemberCard.jsx
│           ├── TaskItem.jsx
│           └── LinkBadge.jsx        # Jira/Confluence/Atlas badge
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js                 # Express entry point
│       ├── db.js                    # pg connection pool
│       ├── migrate.js               # runs schema on startup
│       ├── schema.sql               # DDL for all tables
│       └── routes/
│           ├── projects.js          # CRUD + links + members
│           ├── members.js           # CRUD
│           └── tasks.js             # CRUD
```

---

## Pages / Features

### Dashboard
- Summary counts: active projects, team size, open tasks
- Recent projects and upcoming/overdue tasks

### Projects
- List view with status badges (Active / On Hold / Completed)
- Create / edit / delete projects
- Filter by status

### Project Detail
- Description & notes (editable inline)
- External links section (add Jira / Confluence / Atlas / custom URLs with labels)
- Assigned engineers (add/remove from team)
- Related tasks

### Team Members
- List of all engineers with role/email
- Create / edit / delete members

### Member Detail
- Profile: name, role, email, avatar, personal notes
- Shows which projects they are assigned to

### Tasks
- Personal to-do list (optionally linked to a project)
- Status: To Do / In Progress / Done
- Optional due date
- Filterable by project or status

---

## Implementation Todos (in order)

1. **scaffold-repo** — Docker Compose + project scaffolding
2. **backend-db** — PostgreSQL schema, migration runner, pg connection pool
3. **backend-api-members** — REST CRUD for team members
4. **backend-api-projects** — REST CRUD for projects + links + member assignments
5. **backend-api-tasks** — REST CRUD for tasks
6. **frontend-scaffold** — Vite + React + Tailwind + React Router setup
7. **frontend-sidebar** — Sidebar navigation component
8. **frontend-dashboard** — Dashboard summary page
9. **frontend-projects** — Projects list + Project Detail pages
10. **frontend-members** — Team Members list + Member Detail pages
11. **frontend-tasks** — Tasks page
12. **docker-wiring** — Verify full stack starts cleanly with `docker compose up`
