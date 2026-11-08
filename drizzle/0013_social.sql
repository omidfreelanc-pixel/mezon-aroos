-- Share, like, comment and "may we post this on the boutique's social media" for a result, plus a
-- customer who talks to the bot instead of the page. Additive only.
-- social_consent: 0 not asked, 1 yes, 2 no. share_token: unguessable id of the public post page.
ALTER TABLE generations ADD COLUMN share_token TEXT;
--> statement-breakpoint
ALTER TABLE generations ADD COLUMN social_consent INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE generations ADD COLUMN social_at INTEGER;
--> statement-breakpoint
ALTER TABLE generations ADD COLUMN notified INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE generations ADD COLUMN owner_name TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
CREATE UNIQUE INDEX gen_share ON generations(share_token) WHERE share_token IS NOT NULL;
--> statement-breakpoint
CREATE INDEX gen_social ON generations(salon_id,social_consent,social_at);
--> statement-breakpoint
ALTER TABLE sessions ADD COLUMN bot_platform TEXT;
--> statement-breakpoint
ALTER TABLE sessions ADD COLUMN bot_chat TEXT;
--> statement-breakpoint
ALTER TABLE sessions ADD COLUMN bot_name TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
CREATE TABLE reactions(id TEXT PRIMARY KEY,generation_id TEXT NOT NULL,kind TEXT NOT NULL,name TEXT NOT NULL DEFAULT '',body TEXT NOT NULL DEFAULT '',visitor TEXT NOT NULL DEFAULT '',created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX react_gen ON reactions(generation_id,kind,created_at);
--> statement-breakpoint
CREATE UNIQUE INDEX react_like ON reactions(generation_id,visitor) WHERE kind='like' AND visitor<>'';
--> statement-breakpoint
CREATE TABLE bot_customers(platform TEXT NOT NULL,chat_id TEXT NOT NULL,salon_id TEXT NOT NULL,name TEXT NOT NULL DEFAULT '',created_at INTEGER NOT NULL,PRIMARY KEY(platform,chat_id));
