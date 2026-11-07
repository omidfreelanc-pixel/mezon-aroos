-- Salon staff (e.g. a cutter or a colourist). Each member links their own Telegram/Bale chat with a
-- one-time invite and gets a permanent referral code (`ref_code`, in links as ?r=<code>).
-- A removed member keeps their row (active=0) and points to whoever inherited their customers.
CREATE TABLE team(id TEXT PRIMARY KEY,salon_id TEXT NOT NULL REFERENCES salons(id),name TEXT NOT NULL,specialty TEXT NOT NULL DEFAULT '',ref_code TEXT NOT NULL UNIQUE,telegram_chat_id TEXT,bale_chat_id TEXT,invite_hash TEXT,invite_expires INTEGER,active INTEGER NOT NULL DEFAULT 1,replaced_by TEXT,created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX team_salon ON team(salon_id,active);
--> statement-breakpoint
CREATE INDEX team_tg ON team(telegram_chat_id);
--> statement-breakpoint
CREATE INDEX team_bale ON team(bale_chat_id);
--> statement-breakpoint
CREATE INDEX team_invite ON team(invite_hash);
--> statement-breakpoint
-- Referral tree, per salon. `visitor` is the browser's random id; `tag` is its public code used in
-- the links it shares (?r=<tag>). The first link decides `staff_id` (NULL = the salon itself) and it
-- is inherited by everyone this visitor brings. `name` is filled when the visitor sends a request.
-- `conflict_staff` remembers a later visit through another member's link, for the manager to decide.
CREATE TABLE ref_visitors(salon_id TEXT NOT NULL,visitor TEXT NOT NULL,tag TEXT NOT NULL UNIQUE,staff_id TEXT,parent_visitor TEXT,gen INTEGER NOT NULL DEFAULT 0,came_with TEXT NOT NULL DEFAULT '',name TEXT,conflict_staff TEXT,created_at INTEGER NOT NULL,PRIMARY KEY(salon_id,visitor));
--> statement-breakpoint
CREATE INDEX ref_parent ON ref_visitors(salon_id,parent_visitor);
--> statement-breakpoint
CREATE INDEX ref_staff ON ref_visitors(staff_id);
--> statement-breakpoint
-- A mobile number, once known, keeps its owner on any device. Only a keyed hash is stored.
CREATE TABLE ref_phones(salon_id TEXT NOT NULL,phone_hash TEXT NOT NULL,staff_id TEXT,visitor TEXT NOT NULL DEFAULT '',created_at INTEGER NOT NULL,PRIMARY KEY(salon_id,phone_hash));
--> statement-breakpoint
CREATE INDEX ref_phone_staff ON ref_phones(staff_id);
--> statement-breakpoint
-- Which member a request belongs to, and whether it waits for that member to link the bot.
ALTER TABLE leads ADD COLUMN staff_id TEXT;
--> statement-breakpoint
ALTER TABLE leads ADD COLUMN waiting INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
CREATE INDEX lead_staff ON leads(staff_id,waiting);
--> statement-breakpoint
-- Portfolio sent by a member carries their id (the existing `stylist` column holds their name).
ALTER TABLE portfolio ADD COLUMN staff_id TEXT;
