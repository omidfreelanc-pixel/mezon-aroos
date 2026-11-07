-- Anonymous usage events for the owner dashboard. `visitor` is a random id the browser makes
-- for itself (no name, phone or photo); events are kept for 400 days.
CREATE TABLE events_log(id TEXT PRIMARY KEY,salon_id TEXT NOT NULL,visitor TEXT NOT NULL DEFAULT '',kind TEXT NOT NULL,meta TEXT NOT NULL DEFAULT '',created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX events_log_salon ON events_log(salon_id,created_at);
--> statement-breakpoint
CREATE INDEX events_log_kind ON events_log(kind,created_at);
--> statement-breakpoint
-- What the salon did with a submission (one tap in the bot), reminders sent, the bot messages
-- to update, and the customer's optional follow link (only the hash of its token is stored).
ALTER TABLE leads ADD COLUMN salon_status TEXT NOT NULL DEFAULT 'new';
--> statement-breakpoint
ALTER TABLE leads ADD COLUMN handled_at INTEGER;
--> statement-breakpoint
ALTER TABLE leads ADD COLUMN reminders INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE leads ADD COLUMN messages TEXT NOT NULL DEFAULT '{}';
--> statement-breakpoint
ALTER TABLE leads ADD COLUMN follow_hash TEXT;
--> statement-breakpoint
ALTER TABLE leads ADD COLUMN follow_chat TEXT;
--> statement-breakpoint
ALTER TABLE leads ADD COLUMN follow_platform TEXT;
--> statement-breakpoint
ALTER TABLE leads ADD COLUMN visitor TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
CREATE INDEX lead_followup ON leads(status,salon_status,created_at);
--> statement-breakpoint
-- Bale (بله) as a second inbox next to Telegram, and the bot's setup-wizard progress.
ALTER TABLE salons ADD COLUMN bale_chat_id TEXT;
--> statement-breakpoint
ALTER TABLE salons ADD COLUMN bot_state TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
CREATE INDEX salon_bale ON salons(bale_chat_id);
