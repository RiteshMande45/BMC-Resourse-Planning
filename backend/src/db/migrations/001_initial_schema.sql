CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── AUTH & PEOPLE ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role          VARCHAR(20)  NOT NULL
                    CHECK (role IN ('owner','sales','manager','employee','hr')),
    is_active     BOOLEAN      DEFAULT TRUE,
    last_login    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID         NOT NULL REFERENCES users(id),
    type          VARCHAR(30)  NOT NULL
                    CHECK (type IN ('employee','intern','intern_unpaid','part_time')),
    designation   VARCHAR(100),
    weekly_hours  INTEGER      DEFAULT 40,
    reports_to    UUID         REFERENCES employees(id),
    joined_on     DATE,
    intern_end    DATE,
    hr_portal_id  VARCHAR(100) UNIQUE,
    created_at    TIMESTAMPTZ  DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- ── SKILLS ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS skills (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) UNIQUE NOT NULL,
    category   VARCHAR(50),
    created_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employee_skills (
    id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID      NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    skill_id    UUID      NOT NULL REFERENCES skills(id),
    level       SMALLINT  NOT NULL CHECK (level BETWEEN 1 AND 3),
    years       DECIMAL(4,1),
    updated_on  DATE      DEFAULT CURRENT_DATE,
    UNIQUE(employee_id, skill_id)
);

CREATE TABLE IF NOT EXISTS certificates (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID         NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    skill_id    UUID         REFERENCES skills(id),
    title       VARCHAR(200) NOT NULL,
    file_id     VARCHAR(255),
    status      VARCHAR(20)  NOT NULL DEFAULT 'self_reported'
                  CHECK (status IN ('self_reported','verified','rejected')),
    verified_by UUID         REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_logs (
    id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID  NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month       DATE  NOT NULL,
    summary     TEXT  NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, month)
);

-- ── PROJECTS & CLIENTS ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS clients (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(200) NOT NULL,
    contact_name  VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    created_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deals (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID          NOT NULL REFERENCES clients(id),
    name            VARCHAR(200)  NOT NULL,
    stage           VARCHAR(50),
    win_probability SMALLINT      CHECK (win_probability BETWEEN 0 AND 100),
    value           DECIMAL(12,2),
    expected_start  DATE,
    created_by      UUID          REFERENCES users(id),
    created_at      TIMESTAMPTZ   DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id   UUID         REFERENCES clients(id),
    name        VARCHAR(200) NOT NULL,
    domain      VARCHAR(100),
    description TEXT,
    start_date  DATE,
    due_date    DATE,
    budget      DECIMAL(12,2),
    status      VARCHAR(20)  NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new','planning','planned','active','on_hold','completed')),
    manager_id  UUID         REFERENCES employees(id),
    created_by  UUID         REFERENCES users(id),
    created_at  TIMESTAMPTZ  DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_skills (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    skill_id   UUID NOT NULL REFERENCES skills(id),
    PRIMARY KEY (project_id, skill_id)
);

CREATE TABLE IF NOT EXISTS documents (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type        VARCHAR(20)  NOT NULL CHECK (type IN ('PRD','MOM','SOW','Other')),
    file_url    VARCHAR(500) NOT NULL,
    uploaded_by UUID         REFERENCES users(id),
    uploaded_at TIMESTAMPTZ  DEFAULT NOW()
);

-- ── ALLOCATIONS & WORK ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS allocations (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID        NOT NULL REFERENCES employees(id),
    project_id  UUID        NOT NULL REFERENCES projects(id),
    role        VARCHAR(100),
    percent     SMALLINT    NOT NULL CHECK (percent BETWEEN 1 AND 100),
    from_date   DATE        NOT NULL,
    to_date     DATE        NOT NULL,
    kind        VARCHAR(20) NOT NULL DEFAULT 'planned'
                  CHECK (kind IN ('planned','short_term')),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    CHECK (from_date <= to_date)
);

-- Index for the 100% rule check: look up all allocations for an employee on a date range
CREATE INDEX IF NOT EXISTS idx_alloc_employee_dates
    ON allocations(employee_id, from_date, to_date);

CREATE TABLE IF NOT EXISTS tasks (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id     UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_id      UUID         REFERENCES tasks(id),
    title          VARCHAR(300) NOT NULL,
    assignee_id    UUID         REFERENCES employees(id),
    estimate_hrs   DECIMAL(6,2),
    start_date     DATE,
    due_date       DATE,
    status         VARCHAR(20)  NOT NULL DEFAULT 'todo'
                     CHECK (status IN ('todo','in_progress','blocked','done')),
    blocked_reason TEXT,
    blocked_by_id  UUID         REFERENCES employees(id),
    created_at     TIMESTAMPTZ  DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS time_entries (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id        UUID          NOT NULL REFERENCES tasks(id),
    employee_id    UUID          NOT NULL REFERENCES employees(id),
    work_date      DATE          NOT NULL,
    hours          DECIMAL(4,2)  NOT NULL CHECK (hours > 0 AND hours <= 12),
    note           TEXT          NOT NULL CHECK (char_length(note) >= 10),
    source         VARCHAR(10)   NOT NULL DEFAULT 'app'
                     CHECK (source IN ('app','timer','sheet')),
    sheet_entry_id VARCHAR(100),
    created_at     TIMESTAMPTZ   DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timesheet_weeks (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID        NOT NULL REFERENCES employees(id),
    week_start  DATE        NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','submitted','approved','returned')),
    approved_by UUID        REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    UNIQUE(employee_id, week_start)
);

-- ── HR & RESOURCE REQUESTS ────────────────────────────────────

CREATE TABLE IF NOT EXISTS leaves (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID         NOT NULL REFERENCES employees(id),
    hr_leave_id VARCHAR(100) UNIQUE,
    type        VARCHAR(50),
    from_date   DATE         NOT NULL,
    to_date     DATE         NOT NULL,
    half_day    BOOLEAN      DEFAULT FALSE,
    status      VARCHAR(20)  NOT NULL
                  CHECK (status IN ('applied','approved','rejected','cancelled')),
    synced_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resource_requests (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID        NOT NULL REFERENCES projects(id),
    manager_id UUID        NOT NULL REFERENCES employees(id),
    kind       VARCHAR(20) NOT NULL CHECK (kind IN ('current','upcoming')),
    from_date  DATE        NOT NULL,
    to_date    DATE        NOT NULL,
    note       TEXT,
    status     VARCHAR(30) NOT NULL DEFAULT 'sent_to_owner'
                 CHECK (status IN ('sent_to_owner','forwarded_to_hr',
                                   'returned_to_manager','hr_working','fulfilled')),
    owner_note TEXT,
    hr_action  VARCHAR(30)
                 CHECK (hr_action IN ('assign_internal','train','hire','contractor')),
    hr_note    TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resource_request_lines (
    id           UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id   UUID     NOT NULL REFERENCES resource_requests(id) ON DELETE CASCADE,
    skill_id     UUID     NOT NULL REFERENCES skills(id),
    people_count SMALLINT NOT NULL DEFAULT 1,
    percent      SMALLINT NOT NULL CHECK (percent BETWEEN 1 AND 100)
);

CREATE TABLE IF NOT EXISTS request_events (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID        NOT NULL REFERENCES resource_requests(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id),
    action     VARCHAR(50) NOT NULL,
    at         TIMESTAMPTZ DEFAULT NOW()
);

-- ── SYSTEM & AUDIT ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoices (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id   UUID          NOT NULL REFERENCES projects(id),
    amount       DECIMAL(12,2) NOT NULL,
    invoice_date DATE          NOT NULL,
    status       VARCHAR(30)   NOT NULL DEFAULT 'pending',
    created_at   TIMESTAMPTZ   DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id),
    type       VARCHAR(50) NOT NULL,
    message    TEXT        NOT NULL,
    is_read    BOOLEAN     DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         REFERENCES users(id),
    table_name VARCHAR(100) NOT NULL,
    record_id  UUID         NOT NULL,
    action     VARCHAR(10)  NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
    before     JSONB,
    after      JSONB,
    at         TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sync_runs (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    source      VARCHAR(30) NOT NULL CHECK (source IN ('google_sheet','hr_portal')),
    started_at  TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    rows_ok     INTEGER     DEFAULT 0,
    rows_failed INTEGER     DEFAULT 0,
    error       TEXT
);
