-- The visitor's own name and mobile number (asked on the welcome screen), her thumbs up/down on a result,
-- and the number she shared with the bot, so "send it to me" can find her chat.
ALTER TABLE sessions ADD COLUMN cust_name TEXT NOT NULL DEFAULT '';
ALTER TABLE sessions ADD COLUMN cust_phone TEXT NOT NULL DEFAULT '';
ALTER TABLE bot_customers ADD COLUMN phone TEXT NOT NULL DEFAULT '';
ALTER TABLE generations ADD COLUMN reaction TEXT NOT NULL DEFAULT '';
