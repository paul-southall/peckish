import Database, { type Database as DatabaseType } from 'better-sqlite3';

export type Db = DatabaseType;

const SCHEMA_V1 = `
  CREATE TABLE IF NOT EXISTS pantry_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT '',
    expiry TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY);
`;

const CURRENT_VERSION = 1;

export function migrate(db: Db): void {
  const apply = db.transaction(() => {
    db.exec(SCHEMA_V1);
    const row = db.prepare('SELECT version FROM schema_version LIMIT 1').get() as
      | { version: number }
      | undefined;
    if (!row) {
      db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(CURRENT_VERSION);
    }
    // Future migrations: branch on row.version and step forward.
  });
  apply();
}

export function initDb(path: string): Db {
  const db = new Database(path);
  db.pragma('foreign_keys = ON');
  migrate(db);
  return db;
}
