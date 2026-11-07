CREATE TABLE salons(id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, owner_id TEXT NOT NULL, name TEXT NOT NULL, profile TEXT NOT NULL DEFAULT '{}', settings TEXT NOT NULL DEFAULT '{}', created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE members(salon_id TEXT NOT NULL REFERENCES salons(id), user_id TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'manager', PRIMARY KEY(salon_id,user_id));
--> statement-breakpoint
CREATE TABLE staff(id TEXT PRIMARY KEY,salon_id TEXT NOT NULL REFERENCES salons(id),name TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1);
--> statement-breakpoint
CREATE TABLE services(id TEXT PRIMARY KEY,salon_id TEXT NOT NULL REFERENCES salons(id),name TEXT NOT NULL,duration INTEGER NOT NULL CHECK(duration BETWEEN 15 AND 1440),staff_id TEXT REFERENCES staff(id),active INTEGER NOT NULL DEFAULT 1);
--> statement-breakpoint
CREATE TABLE customers(id TEXT PRIMARY KEY,salon_id TEXT NOT NULL REFERENCES salons(id),name TEXT NOT NULL,phone TEXT NOT NULL,consent INTEGER NOT NULL DEFAULT 0,followup INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL,UNIQUE(salon_id,phone));
--> statement-breakpoint
CREATE TABLE sessions(id TEXT PRIMARY KEY,salon_id TEXT NOT NULL REFERENCES salons(id),customer_id TEXT REFERENCES customers(id),token_hash TEXT NOT NULL UNIQUE,expires_at INTEGER NOT NULL,created_at INTEGER NOT NULL,request_id TEXT,proposal_version INTEGER);
--> statement-breakpoint
CREATE TABLE media(id TEXT PRIMARY KEY,salon_id TEXT NOT NULL REFERENCES salons(id),session_id TEXT REFERENCES sessions(id),kind TEXT NOT NULL,object_key TEXT NOT NULL UNIQUE,mime TEXT NOT NULL,created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE portfolio(id TEXT PRIMARY KEY,salon_id TEXT NOT NULL REFERENCES salons(id),title TEXT NOT NULL,category TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',stylist TEXT NOT NULL DEFAULT '',images TEXT NOT NULL DEFAULT '[]',published INTEGER NOT NULL DEFAULT 0,try_on INTEGER NOT NULL DEFAULT 0,permission INTEGER NOT NULL DEFAULT 0,version INTEGER NOT NULL DEFAULT 1);
--> statement-breakpoint
CREATE TABLE generations(id TEXT PRIMARY KEY,salon_id TEXT NOT NULL REFERENCES salons(id),session_id TEXT NOT NULL REFERENCES sessions(id),idem TEXT NOT NULL,kind TEXT NOT NULL DEFAULT 'single',state TEXT NOT NULL,task_id TEXT,original_id TEXT NOT NULL,reference_id TEXT,result_id TEXT,style INTEGER,transfer TEXT,color TEXT,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL,UNIQUE(session_id,idem));
--> statement-breakpoint
CREATE TABLE requests(id TEXT PRIMARY KEY,salon_id TEXT NOT NULL REFERENCES salons(id),session_id TEXT NOT NULL REFERENCES sessions(id),customer_id TEXT NOT NULL REFERENCES customers(id),service_id TEXT NOT NULL REFERENCES services(id),original_id TEXT,reference_id TEXT,preview_id TEXT,note TEXT NOT NULL DEFAULT '',review TEXT NOT NULL DEFAULT 'pending',review_note TEXT NOT NULL DEFAULT '',review_version INTEGER NOT NULL DEFAULT 0,idem TEXT NOT NULL,created_at INTEGER NOT NULL,UNIQUE(session_id,idem));
--> statement-breakpoint
CREATE TABLE appointments(id TEXT PRIMARY KEY,request_id TEXT NOT NULL UNIQUE REFERENCES requests(id),salon_id TEXT NOT NULL REFERENCES salons(id),staff_id TEXT NOT NULL REFERENCES staff(id),duration INTEGER NOT NULL CHECK(duration BETWEEN 15 AND 1440),start_at INTEGER,end_at INTEGER,status TEXT NOT NULL,last_actor TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,note TEXT NOT NULL DEFAULT '',updated_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TRIGGER no_overlap_insert BEFORE INSERT ON appointments WHEN NEW.status='confirmed' BEGIN SELECT RAISE(ABORT,'APPOINTMENT_CONFLICT') WHERE EXISTS(SELECT 1 FROM appointments a WHERE a.salon_id=NEW.salon_id AND a.staff_id=NEW.staff_id AND a.status='confirmed' AND a.start_at<NEW.end_at AND a.end_at>NEW.start_at); END;
--> statement-breakpoint
CREATE TRIGGER no_overlap_update BEFORE UPDATE ON appointments WHEN NEW.status='confirmed' BEGIN SELECT RAISE(ABORT,'APPOINTMENT_CONFLICT') WHERE EXISTS(SELECT 1 FROM appointments a WHERE a.id<>NEW.id AND a.salon_id=NEW.salon_id AND a.staff_id=NEW.staff_id AND a.status='confirmed' AND a.start_at<NEW.end_at AND a.end_at>NEW.start_at); END;
--> statement-breakpoint
CREATE TABLE messages(id TEXT PRIMARY KEY,salon_id TEXT NOT NULL REFERENCES salons(id),customer_id TEXT NOT NULL REFERENCES customers(id),request_id TEXT REFERENCES requests(id),event TEXT NOT NULL,event_version INTEGER NOT NULL,dedupe TEXT NOT NULL UNIQUE,body TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'queued',attempts INTEGER NOT NULL DEFAULT 0,next_at INTEGER NOT NULL,lease_until INTEGER,provider_id TEXT,last_error TEXT,created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE attempts(id TEXT PRIMARY KEY,message_id TEXT NOT NULL REFERENCES messages(id),outcome TEXT NOT NULL,created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL DEFAULT 1,expires_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX appointment_lookup ON appointments(salon_id,staff_id,status,start_at,end_at);
--> statement-breakpoint
CREATE INDEX request_lookup ON requests(salon_id,customer_id,created_at);
--> statement-breakpoint
CREATE INDEX message_queue ON messages(status,next_at);
--> statement-breakpoint
CREATE INDEX session_lookup ON sessions(token_hash,expires_at);
--> statement-breakpoint
CREATE TABLE events(id TEXT PRIMARY KEY,salon_id TEXT NOT NULL,request_id TEXT NOT NULL,event TEXT NOT NULL,event_version INTEGER NOT NULL,processed INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TRIGGER request_event AFTER INSERT ON requests BEGIN INSERT INTO events VALUES(NEW.id||':received',NEW.salon_id,NEW.id,'received',1,0,NEW.created_at); END;
--> statement-breakpoint
CREATE TRIGGER review_event AFTER UPDATE OF review_version ON requests WHEN NEW.review_version<>OLD.review_version BEGIN INSERT INTO events VALUES(NEW.id||':review:'||NEW.review_version,NEW.salon_id,NEW.id,'review',NEW.review_version,0,CAST(unixepoch('subsec')*1000 AS INTEGER)); END;
--> statement-breakpoint
CREATE TRIGGER appointment_event AFTER UPDATE ON appointments WHEN NEW.version<>OLD.version BEGIN INSERT INTO events VALUES(NEW.id||':appointment:'||NEW.version,NEW.salon_id,NEW.request_id,'appointment',NEW.version,0,NEW.updated_at); UPDATE messages SET status='cancelled' WHERE request_id=NEW.request_id AND status IN ('queued','retry') AND event IN ('reminder','followup'); END;
