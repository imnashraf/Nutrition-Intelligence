-- db/migrations/002_documents.sql
CREATE TABLE IF NOT EXISTS documents (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  publisher      TEXT NOT NULL,
  year           INTEGER NOT NULL,
  source_url     TEXT NOT NULL,
  retrieval_date DATE NOT NULL,
  category       TEXT NOT NULL CHECK(category IN ('nutrition', 'food_safety', 'cooking')),
  filename       TEXT NOT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
