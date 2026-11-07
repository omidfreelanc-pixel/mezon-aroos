-- Hair colour is its own line. A colour simulation can be made on the customer's original photo or
-- on her new hairstyle result; `base_id` is the media it was made on (NULL = the original photo).
ALTER TABLE generations ADD COLUMN base_id TEXT;
