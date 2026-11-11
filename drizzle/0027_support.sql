-- AI support agent: per-chat short history (24 h) and the tickets handed to a human expert.
CREATE TABLE support_hist(platform TEXT NOT NULL,chat_id TEXT NOT NULL,turns TEXT NOT NULL DEFAULT '[]',awaiting_contact INTEGER NOT NULL DEFAULT 0,updated_at INTEGER NOT NULL,PRIMARY KEY(platform,chat_id));
CREATE TABLE support_escalations(id TEXT PRIMARY KEY,platform TEXT NOT NULL,chat_id TEXT NOT NULL,name TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL DEFAULT '',last_messages TEXT NOT NULL DEFAULT '',reason TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'new',created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL);
CREATE INDEX support_esc_chat ON support_escalations(platform,chat_id,status,created_at);
