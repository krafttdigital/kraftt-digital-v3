-- Independent of admin_workspace; existing clients and documents remain untouched.
CREATE TABLE IF NOT EXISTS admin_agency (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  revision INTEGER NOT NULL DEFAULT 0,
  snapshot TEXT NOT NULL DEFAULT '{"records":[]}',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO admin_agency (id, revision, snapshot) VALUES (1, 0, '{"records":[]}');
