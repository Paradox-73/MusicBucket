CREATE TABLE IF NOT EXISTS bucket_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  artists TEXT,
  added_at TEXT NOT NULL,
  listened INTEGER NOT NULL DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'medium',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);