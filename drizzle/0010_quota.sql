-- Per-person image quota: each simulation keeps the browser id that asked for it, so a new session
-- in the same browser still counts against the same quota.
ALTER TABLE generations ADD COLUMN visitor TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
CREATE INDEX gen_visitor ON generations(salon_id,visitor);
--> statement-breakpoint
CREATE INDEX gen_session ON generations(session_id);
