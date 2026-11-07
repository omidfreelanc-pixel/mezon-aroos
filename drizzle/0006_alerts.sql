-- Small app-wide settings (owner alert link code, last nightly digest day, ...).
CREATE TABLE app_settings(key TEXT PRIMARY KEY,value TEXT NOT NULL,updated_at INTEGER NOT NULL);
--> statement-breakpoint
-- The project owner's own bot chats, which receive alerts and the nightly digest.
CREATE TABLE owner_chats(platform TEXT NOT NULL,chat_id TEXT NOT NULL,created_at INTEGER NOT NULL,PRIMARY KEY(platform,chat_id));
--> statement-breakpoint
-- What happened in the bot, for the owner console and alerts (no customer mobiles or photos).
CREATE TABLE activity(id TEXT PRIMARY KEY,salon_id TEXT,kind TEXT NOT NULL,level TEXT NOT NULL DEFAULT 'info',text TEXT NOT NULL,created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX activity_time ON activity(created_at);
--> statement-breakpoint
-- Updates already handled (Telegram may deliver one twice); kept a few days.
CREATE TABLE bot_seen(key TEXT PRIMARY KEY,created_at INTEGER NOT NULL);
--> statement-breakpoint
-- The salon manager can also work as a member with their own referral link.
ALTER TABLE team ADD COLUMN is_manager INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
-- Photos sent together share one caption.
ALTER TABLE portfolio ADD COLUMN media_group TEXT;
--> statement-breakpoint
-- The owner has been told this request is unanswered or stuck.
ALTER TABLE leads ADD COLUMN owner_alerted INTEGER NOT NULL DEFAULT 0;
