-- Service lines: hair (default), nails, lashes. Portfolio, simulations and requests carry their line;
-- simulations also keep the chosen options (nail shape and length, lash mapping and length).
ALTER TABLE portfolio ADD COLUMN line TEXT NOT NULL DEFAULT 'dress';
--> statement-breakpoint
ALTER TABLE generations ADD COLUMN line TEXT NOT NULL DEFAULT 'dress';
--> statement-breakpoint
ALTER TABLE generations ADD COLUMN opts TEXT NOT NULL DEFAULT '{}';
--> statement-breakpoint
ALTER TABLE leads ADD COLUMN line TEXT NOT NULL DEFAULT 'dress';
