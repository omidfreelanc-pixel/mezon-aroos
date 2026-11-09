-- Sandbox trial clock (starts at the first image), low-credit alert flags, credit refunds, traffic source,
-- credit ledger and the bad-result log used for evals.
ALTER TABLE trials ADD COLUMN started_at INTEGER;
UPDATE trials SET started_at=created_at;
ALTER TABLE salons ADD COLUMN alert20 INTEGER NOT NULL DEFAULT 0;
ALTER TABLE salons ADD COLUMN alert5 INTEGER NOT NULL DEFAULT 0;
ALTER TABLE generations ADD COLUMN refunded INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events_log ADD COLUMN src TEXT NOT NULL DEFAULT '';
CREATE TABLE credit_ledger(id TEXT PRIMARY KEY, salon_id TEXT NOT NULL, amount INTEGER NOT NULL, method TEXT NOT NULL, ref TEXT NOT NULL DEFAULT '', by_who TEXT NOT NULL DEFAULT '', limit_after INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL);
CREATE INDEX credit_ledger_salon ON credit_ledger(salon_id, created_at);
CREATE INDEX credit_ledger_time ON credit_ledger(created_at);
-- Opening balance of every salon that exists today.
INSERT INTO credit_ledger(id,salon_id,amount,method,ref,by_who,limit_after,created_at) SELECT lower(hex(randomblob(16))),id,credit_limit,'opening','migration','system',credit_limit,created_at FROM salons;
CREATE TABLE reaction_log(id TEXT PRIMARY KEY, generation_id TEXT NOT NULL UNIQUE, salon_id TEXT NOT NULL, reaction TEXT NOT NULL, reason TEXT NOT NULL DEFAULT '', note TEXT NOT NULL DEFAULT '', refunded INTEGER NOT NULL DEFAULT 0, line TEXT NOT NULL DEFAULT '', model TEXT NOT NULL DEFAULT '', reference_id TEXT, style INTEGER, created_at INTEGER NOT NULL);
CREATE INDEX reaction_log_salon ON reaction_log(salon_id, created_at);
