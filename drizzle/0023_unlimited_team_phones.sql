-- Three team mobiles get no image limits (see unlimited() in worker/server.js). Existing entries are kept.
INSERT INTO app_settings(key,value,updated_at) VALUES('unlimited_phones','["+989105647497","+989933773515","+989375129991"]',CAST(strftime('%s','now') AS INTEGER)*1000)
ON CONFLICT(key) DO UPDATE SET value=(SELECT json_group_array(v) FROM (SELECT value AS v FROM json_each(app_settings.value) UNION SELECT value FROM json_each('["+989105647497","+989933773515","+989375129991"]'))),updated_at=excluded.updated_at;
