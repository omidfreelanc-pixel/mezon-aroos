-- Telegram replaces the salon panel and the booking flow.
-- Old tables (services, staff, customers, requests, appointments, messages, events) are left
-- in place so existing data is not destroyed; the app no longer writes to them.
ALTER TABLE salons ADD COLUMN telegram_chat_id TEXT;
--> statement-breakpoint
ALTER TABLE salons ADD COLUMN telegram_code_hash TEXT;
--> statement-breakpoint
ALTER TABLE salons ADD COLUMN telegram_code_expires INTEGER;
--> statement-breakpoint
CREATE INDEX salon_telegram ON salons(telegram_chat_id);
--> statement-breakpoint
CREATE TABLE leads(id TEXT PRIMARY KEY,salon_id TEXT NOT NULL REFERENCES salons(id),session_id TEXT NOT NULL REFERENCES sessions(id),name TEXT NOT NULL,phone TEXT NOT NULL,telegram TEXT NOT NULL DEFAULT '',original_id TEXT NOT NULL,reference_id TEXT,preview_id TEXT,look TEXT NOT NULL DEFAULT '',color TEXT NOT NULL DEFAULT '',note TEXT NOT NULL DEFAULT '',idem TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'queued',attempts INTEGER NOT NULL DEFAULT 0,last_error TEXT,created_at INTEGER NOT NULL,UNIQUE(session_id,idem));
--> statement-breakpoint
CREATE INDEX lead_queue ON leads(status,created_at);
--> statement-breakpoint
-- Portfolio items added from Telegram remember the message so the salon can delete them there.
ALTER TABLE portfolio ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0;
