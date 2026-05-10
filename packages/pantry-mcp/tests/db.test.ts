import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { initDb, migrate, type Db } from '../src/db.js';

const EXPECTED_COLUMNS = ['id', 'name', 'quantity', 'unit', 'expiry', 'created_at'];

describe('db', () => {
  let scratch: string;

  beforeEach(async () => {
    scratch = await mkdtemp(join(tmpdir(), 'peckish-db-'));
  });

  afterEach(async () => {
    await rm(scratch, { recursive: true, force: true });
  });

  it('initialises an in-memory database with the v1 schema', () => {
    const db = initDb(':memory:');
    try {
      expect(tableExists(db, 'pantry_items')).toBe(true);
      expect(columnsOf(db, 'pantry_items')).toEqual(EXPECTED_COLUMNS);
      expect(currentVersion(db)).toBe(1);
    } finally {
      db.close();
    }
  });

  it('creates the database file on disk when given a path', () => {
    const path = join(scratch, 'pantry.sqlite');
    expect(existsSync(path)).toBe(false);

    const db = initDb(path);
    try {
      expect(existsSync(path)).toBe(true);
      expect(tableExists(db, 'pantry_items')).toBe(true);
    } finally {
      db.close();
    }
  });

  it('runs migrations idempotently', () => {
    const db = initDb(':memory:');
    try {
      expect(() => {
        migrate(db);
        migrate(db);
      }).not.toThrow();
      expect(currentVersion(db)).toBe(1);
      const versionRows = db.prepare('SELECT COUNT(*) as n FROM schema_version').get() as {
        n: number;
      };
      expect(versionRows.n).toBe(1);
    } finally {
      db.close();
    }
  });
});

function tableExists(db: Db, name: string): boolean {
  const row = db
    .prepare('SELECT name FROM sqlite_master WHERE type = ? AND name = ?')
    .get('table', name);
  return row !== undefined;
}

function columnsOf(db: Db, table: string): string[] {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return rows.map((r) => r.name);
}

function currentVersion(db: Db): number {
  const row = db.prepare('SELECT version FROM schema_version LIMIT 1').get() as
    | { version: number }
    | undefined;
  return row?.version ?? -1;
}
