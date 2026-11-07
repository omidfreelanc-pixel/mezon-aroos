-- Mobile verification (one-time code by SMS) and salon invitation texts, both through Melipayamak.
-- A session that passed verification remembers the verified mobile and name; both are cleared
-- again by the retention job after 30 days.
ALTER TABLE sessions ADD COLUMN verified_phone TEXT;
--> statement-breakpoint
ALTER TABLE sessions ADD COLUMN verified_name TEXT;
--> statement-breakpoint
-- Only the hash of the code is stored (the code itself is generated and texted by Melipayamak).
CREATE TABLE otps(id TEXT PRIMARY KEY,session_id TEXT NOT NULL,phone TEXT NOT NULL,first_name TEXT NOT NULL,last_name TEXT NOT NULL,code_hash TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,expires_at INTEGER NOT NULL,created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX otp_session ON otps(session_id,created_at);
--> statement-breakpoint
-- Texts a salon sent from the Telegram bot (its link to a customer). Kept for 30 days.
CREATE TABLE invites(id TEXT PRIMARY KEY,salon_id TEXT NOT NULL REFERENCES salons(id),phone TEXT NOT NULL,rec_id TEXT,status TEXT NOT NULL,error TEXT,created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX invite_lookup ON invites(salon_id,phone,created_at);
