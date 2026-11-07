-- Salons that ask to try Ayneh from the public landing page. Sent to the owner's bot chat; kept here as a backup.
CREATE TABLE inquiries(id TEXT PRIMARY KEY,name TEXT NOT NULL,salon TEXT NOT NULL,city TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL,note TEXT NOT NULL DEFAULT '',chosen TEXT NOT NULL DEFAULT '',created_at INTEGER NOT NULL,notified INTEGER NOT NULL DEFAULT 0);
--> statement-breakpoint
CREATE INDEX inquiries_time ON inquiries(created_at);
