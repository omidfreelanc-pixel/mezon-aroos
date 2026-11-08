-- Salons approved before approval ended the trial: drop the trial flag, keep the page colour.
UPDATE salons SET settings=json_set(json_remove(settings,'$.trial'),'$.brand',COALESCE((SELECT brand FROM trials WHERE salon_id=salons.id),'')) WHERE approved=1 AND json_extract(settings,'$.trial') IS NOT NULL;
