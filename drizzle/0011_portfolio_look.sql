-- A salon work can carry a written description of its look (English, for the image model). With it,
-- trying the work on sends only the customer's own photo, so the other woman's face and colour in
-- the work photo can never reach the result.
ALTER TABLE portfolio ADD COLUMN look TEXT NOT NULL DEFAULT '';
