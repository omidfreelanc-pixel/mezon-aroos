-- Free trial salon pages made from the landing form: one per mobile, 10 hours, 5 simulated images.
CREATE TABLE trials(id TEXT PRIMARY KEY,salon_id TEXT NOT NULL UNIQUE REFERENCES salons(id),name TEXT NOT NULL,phone TEXT NOT NULL UNIQUE,brand TEXT NOT NULL DEFAULT '',created_at INTEGER NOT NULL,expires_at INTEGER NOT NULL,images_limit INTEGER NOT NULL DEFAULT 5,images_used INTEGER NOT NULL DEFAULT 0);
CREATE INDEX trials_expires ON trials(expires_at);
