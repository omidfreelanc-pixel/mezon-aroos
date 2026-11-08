-- A kiosk shows a QR; the bride's own phone opens /u/<code> and sends her full-length photo into the kiosk's session.
CREATE TABLE IF NOT EXISTS pairings (
  code TEXT PRIMARY KEY,
  salon_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  media_id TEXT,
  received_at INTEGER,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS pairings_session ON pairings(session_id);
