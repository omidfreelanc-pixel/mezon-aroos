-- Delayed messages for the bot (the intro video one minute after the welcome). Processed by tick and on webhook traffic.
CREATE TABLE promo_queue(id TEXT PRIMARY KEY,platform TEXT NOT NULL,chat_id TEXT NOT NULL,kind TEXT NOT NULL DEFAULT 'intro',due_at INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'pending',attempts INTEGER NOT NULL DEFAULT 0,error TEXT,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL);
CREATE INDEX promo_queue_due ON promo_queue(status,due_at);
CREATE INDEX promo_queue_chat ON promo_queue(platform,chat_id,kind,created_at);
