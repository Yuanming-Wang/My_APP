function hasColumn(db, table, column) {
  return db.prepare(`PRAGMA table_info(${table})`).all().some((item) => item.name === column)
}

function addColumn(db, table, column, definition) {
  if (!hasColumn(db, table, column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  }
}

const migrations = [
  {
    version: 1,
    up(db) {
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
          media_type TEXT DEFAULT 'image',
          thumbnail_url TEXT,
          audio_url TEXT,
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
    },
  },
  {
    version: 2,
    up(db) {
      addColumn(db, 'books', 'share_token', 'TEXT')
      addColumn(db, 'drafts', 'owner_id', 'TEXT')
      db.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_books_share_token ON books(share_token);
        CREATE TABLE IF NOT EXISTS assets (
          id TEXT PRIMARY KEY,
          owner_id TEXT,
          book_id TEXT,
          kind TEXT NOT NULL,
          url TEXT NOT NULL UNIQUE,
          thumbnail_url TEXT,
          mime_type TEXT,
          size INTEGER,
          original_name TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL
        );
        CREATE INDEX IF NOT EXISTS idx_assets_book ON assets(book_id);
        CREATE INDEX IF NOT EXISTS idx_assets_owner ON assets(owner_id);
      `)
    },
  },
  {
    version: 3,
    up(db) {
      addColumn(db, 'drafts', 'expires_at', 'TEXT')
      addColumn(db, 'drafts', 'book_id', 'TEXT')
      db.exec(`
        UPDATE drafts SET expires_at = datetime(created_at, '+7 days') WHERE expires_at IS NULL;
        CREATE INDEX IF NOT EXISTS idx_drafts_expires ON drafts(expires_at);
      `)
    },
  },
  {
    version: 4,
    up(db) {
      addColumn(db, 'books', 'deleted_at', 'TEXT')
      db.exec('CREATE INDEX IF NOT EXISTS idx_books_deleted ON books(deleted_at)')
    },
  },
]

export function migrate(db) {
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.pragma('busy_timeout = 5000')

  const current = db.pragma('user_version', { simple: true })

  for (const migration of migrations) {
    if (migration.version <= current) continue
    db.transaction(() => {
      migration.up(db)
      db.pragma(`user_version = ${migration.version}`)
    })()
  }
}
