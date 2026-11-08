-- Step 3: «این لباس را می‌خواهم» requests, per-dress analytics and photo retention. Additive only.
-- intent: '' for the older "send to the boutique" flow, 'want' for a dress reservation request.
-- dress_key: 'p:<portfolio id>' (a boutique dress) or 'd:<n>' (a catalogue dress) the request is about.
-- visit_note: the bride's preferred day/time. closed_at: when the boutique closed the request
-- (booked / cancelled / not possible); its photos are deleted N days after that.
ALTER TABLE leads ADD COLUMN intent TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE leads ADD COLUMN dress_key TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE leads ADD COLUMN visit_note TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE leads ADD COLUMN closed_at INTEGER;
--> statement-breakpoint
-- Requests already closed get a fresh N-day grace from the moment this migration runs.
UPDATE leads SET closed_at=CAST(strftime('%s','now') AS INTEGER)*1000 WHERE salon_status IN('booked','declined') AND closed_at IS NULL;
--> statement-breakpoint
CREATE INDEX lead_dress ON leads(salon_id,intent,created_at);
--> statement-breakpoint
CREATE INDEX media_retention ON media(kind,created_at);
