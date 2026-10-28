CREATE TABLE IF NOT EXISTS admin_workspace (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  revision INTEGER NOT NULL DEFAULT 0,
  active_snapshot TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO admin_workspace (id, revision) VALUES (1, 0);

CREATE TABLE IF NOT EXISTS admin_workspace_chunks (
  snapshot_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  body TEXT NOT NULL,
  PRIMARY KEY (snapshot_id, position)
);
