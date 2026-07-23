-- Schema for the expense-tracker app (fresh install).
-- Apply locally with:
--   psql -d expense_tracker -f db/schema.sql
-- Idempotent (safe to re-run): every statement uses IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS users (
    id            TEXT        PRIMARY KEY,
    email         TEXT        NOT NULL UNIQUE,
    password_hash TEXT        NOT NULL,               -- bcrypt hash, never the plain password
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
    id           TEXT        PRIMARY KEY,
    user_id      TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- owner
    date         DATE        NOT NULL,
    amount_cents BIGINT      NOT NULL CHECK (amount_cents > 0),
    category     TEXT        NOT NULL,
    description  TEXT        NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Every listing query filters by user_id, so it leads the index.
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses (user_id, date DESC, created_at DESC);
