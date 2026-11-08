-- Per-dress commercial info: how it is offered, a free-text price and whether it is in stock.
ALTER TABLE portfolio ADD COLUMN mode TEXT NOT NULL DEFAULT '';
ALTER TABLE portfolio ADD COLUMN price TEXT NOT NULL DEFAULT '';
ALTER TABLE portfolio ADD COLUMN stock TEXT NOT NULL DEFAULT '';
