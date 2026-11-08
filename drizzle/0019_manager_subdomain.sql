-- Salon manager account (username + password chosen at registration) and the salon's own subdomain,
-- created when the project owner approves the account: <subdomain>.<main domain>, manager panel at /manager.
ALTER TABLE salons ADD COLUMN subdomain TEXT;
ALTER TABLE salons ADD COLUMN desired_sub TEXT NOT NULL DEFAULT '';
ALTER TABLE salons ADD COLUMN mgr_user TEXT NOT NULL DEFAULT '';
ALTER TABLE salons ADD COLUMN mgr_salt TEXT NOT NULL DEFAULT '';
ALTER TABLE salons ADD COLUMN mgr_hash TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX salons_subdomain ON salons(subdomain) WHERE subdomain IS NOT NULL;
