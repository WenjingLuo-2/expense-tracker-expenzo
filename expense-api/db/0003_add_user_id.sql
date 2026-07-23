-- Migration: link each expense to its owning user.
--
-- The existing expense rows were demo data created before the users table, so
-- they have no owner. We clear them (TRUNCATE) so we can add a NOT NULL FK
-- column cleanly. In a real system with real data you'd instead add the column
-- as nullable, backfill owners, then set NOT NULL.
--
-- Apply with:  psql -d expense_tracker -f db/0003_add_user_id.sql

TRUNCATE TABLE expenses;

ALTER TABLE expenses
    ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE;

DROP INDEX IF EXISTS idx_expenses_date;
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses (user_id, date DESC, created_at DESC);
