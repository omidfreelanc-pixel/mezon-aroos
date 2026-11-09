-- A result link can carry the other-angle photos too (JSON array of media ids).
ALTER TABLE result_links ADD COLUMN extra TEXT;
