PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS profile (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS flashcard_sets (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  terms_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (json_valid(terms_json))
);

CREATE TABLE IF NOT EXISTS starred_terms (
  set_id TEXT NOT NULL,
  term_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (set_id, term_id),
  FOREIGN KEY (set_id) REFERENCES flashcard_sets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS study_guides (
  id TEXT PRIMARY KEY NOT NULL,
  set_id TEXT NOT NULL,
  markdown TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (set_id) REFERENCES flashcard_sets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY NOT NULL DEFAULT 1,
  startup_lock_enabled INTEGER NOT NULL DEFAULT 1,
  default_model_id TEXT,
  dark_mode INTEGER NOT NULL DEFAULT 0,
  learn_hybrid_enabled INTEGER NOT NULL DEFAULT 0,
  CHECK (id = 1)
);

INSERT OR IGNORE INTO app_settings (id) VALUES (1);

CREATE INDEX IF NOT EXISTS idx_flashcard_sets_created_at ON flashcard_sets(created_at);
CREATE INDEX IF NOT EXISTS idx_flashcard_sets_updated_at ON flashcard_sets(updated_at);
CREATE INDEX IF NOT EXISTS idx_starred_terms_set_id ON starred_terms(set_id);
CREATE INDEX IF NOT EXISTS idx_study_guides_set_id ON study_guides(set_id);
