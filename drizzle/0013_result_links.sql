-- Short-lived public links to ONE result photo, opened from the kiosk's QR code on the bride's own phone.
CREATE TABLE IF NOT EXISTS result_links (
  token TEXT PRIMARY KEY,
  salon_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  media_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS result_links_session ON result_links(session_id);
