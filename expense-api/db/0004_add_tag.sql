-- Migration: add an optional free-text tag to each expense.
-- A tag is just a label; many expenses (across categories) can share the same
-- tag value. Empty string means "no tag". Additive + idempotent — no data loss.
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS tag TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_expenses_user_tag ON expenses (user_id, tag);
