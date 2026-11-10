-- Photos of one dress sent through the bot, kept with the chat's message order so an album's
-- first photo is always the front, then back, then the sides, whatever order they arrive in.
CREATE TABLE portfolio_imgs(portfolio_id TEXT NOT NULL,mid INTEGER NOT NULL,media_id TEXT NOT NULL,PRIMARY KEY(portfolio_id,mid));
