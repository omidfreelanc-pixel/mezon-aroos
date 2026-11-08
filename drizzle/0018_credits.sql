-- Per-salon image credit (100 by default), account approval by the project owner, a private manager link
-- (/m/<token>) and recharge requests. Salons that already existed (made by the owner) stay approved;
-- self-registered trial salons start unapproved: they see and use everything except image generation.
ALTER TABLE salons ADD COLUMN approved INTEGER NOT NULL DEFAULT 0;
ALTER TABLE salons ADD COLUMN credit_limit INTEGER NOT NULL DEFAULT 100;
ALTER TABLE salons ADD COLUMN manage_token TEXT;
UPDATE salons SET approved=1 WHERE owner_id<>'trial';
CREATE TABLE credit_requests(id TEXT PRIMARY KEY, salon_id TEXT NOT NULL, amount INTEGER NOT NULL, note TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'pending', created_at INTEGER NOT NULL, handled_at INTEGER);
CREATE INDEX credit_requests_salon ON credit_requests(salon_id, status);
