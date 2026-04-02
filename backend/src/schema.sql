CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  role        TEXT,
  email       TEXT,
  avatar_url  TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'completed')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  url         TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS project_members (
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  member_id   UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, member_id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
  due_date    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS release_tas (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_name        TEXT NOT NULL,
  release_date        DATE,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  demo_consistency    TEXT NOT NULL DEFAULT '',
  demo_start          TIMESTAMPTZ,
  demo_end            TIMESTAMPTZ,
  database_migrations TEXT NOT NULL DEFAULT '',
  config              TEXT NOT NULL DEFAULT '',
  java_connector      TEXT NOT NULL DEFAULT '',
  java_common         TEXT NOT NULL DEFAULT '',
  foundation          TEXT NOT NULL DEFAULT '',
  generated_source    TEXT NOT NULL DEFAULT '',
  java_server         TEXT NOT NULL DEFAULT '',
  build_logic         TEXT NOT NULL DEFAULT '',
  decisions           TEXT NOT NULL DEFAULT '',
  decision_safety        TEXT NOT NULL DEFAULT '',
  decision_rollback      TEXT NOT NULL DEFAULT '',
  decision_critical_path TEXT NOT NULL DEFAULT '',
  decision_exceptions    TEXT NOT NULL DEFAULT '',
  decision_pipeline      TEXT NOT NULL DEFAULT '',
  decision_tech_approval TEXT NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS note_folders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL DEFAULT 'Untitled',
  content    TEXT NOT NULL DEFAULT '',
  folder_id  UUID REFERENCES note_folders(id) ON DELETE SET NULL,
  category   TEXT NOT NULL DEFAULT '',
  tags       TEXT NOT NULL DEFAULT '',
  pinned     BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS note_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#94a3b8',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe to re-run: add new columns to existing tables
ALTER TABLE release_tas ADD COLUMN IF NOT EXISTS demo_start             TIMESTAMPTZ;
ALTER TABLE release_tas ADD COLUMN IF NOT EXISTS demo_end               TIMESTAMPTZ;
ALTER TABLE release_tas ADD COLUMN IF NOT EXISTS decision_safety        TEXT NOT NULL DEFAULT '';
ALTER TABLE release_tas ADD COLUMN IF NOT EXISTS decision_rollback      TEXT NOT NULL DEFAULT '';
ALTER TABLE release_tas ADD COLUMN IF NOT EXISTS decision_critical_path TEXT NOT NULL DEFAULT '';
ALTER TABLE release_tas ADD COLUMN IF NOT EXISTS decision_exceptions    TEXT NOT NULL DEFAULT '';
ALTER TABLE release_tas ADD COLUMN IF NOT EXISTS decision_pipeline      TEXT NOT NULL DEFAULT '';
ALTER TABLE release_tas ADD COLUMN IF NOT EXISTS decision_tech_approval TEXT NOT NULL DEFAULT '';
