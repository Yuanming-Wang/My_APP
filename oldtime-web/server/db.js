import Database from 'better-sqlite3'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync, existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, 'data')
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })

const db = new Database(join(dataDir, 'oldtime.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    owner_id TEXT,
    title TEXT NOT NULL,
    subtitle TEXT,
    theme TEXT DEFAULT 'years_gold',
    cover_image_url TEXT,
    archive_no TEXT UNIQUE NOT NULL,
    owner_name TEXT NOT NULL,
    certificate_text TEXT,
    share_slug TEXT UNIQUE,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL,
    page_index INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    raw_story TEXT,
    chapter_title TEXT,
    polished_story TEXT,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS drafts (
    id TEXT PRIMARY KEY,
    owner_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS draft_photos (
    id TEXT PRIMARY KEY,
    draft_id TEXT NOT NULL,
    photo_index INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    story TEXT DEFAULT '',
    FOREIGN KEY (draft_id) REFERENCES drafts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS children (
    id TEXT PRIMARY KEY,
    parent_id TEXT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (parent_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_pages_book ON pages(book_id);
  CREATE INDEX IF NOT EXISTS idx_books_owner ON books(owner_id);
  CREATE INDEX IF NOT EXISTS idx_books_slug ON books(share_slug);
  CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status);
  CREATE INDEX IF NOT EXISTS idx_draft_photos_draft ON draft_photos(draft_id);
  CREATE INDEX IF NOT EXISTS idx_children_parent ON children(parent_id);
`)

export default db
