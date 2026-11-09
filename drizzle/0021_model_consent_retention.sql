-- Which image model made each result, and when/which version of the photo-processing consent a session accepted.
ALTER TABLE generations ADD COLUMN model TEXT NOT NULL DEFAULT '';
ALTER TABLE sessions ADD COLUMN consent_at INTEGER;
ALTER TABLE sessions ADD COLUMN consent_version TEXT NOT NULL DEFAULT '';
