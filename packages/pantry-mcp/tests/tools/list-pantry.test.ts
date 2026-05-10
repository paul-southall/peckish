import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { initDb, type Db } from '../../src/db.js';
import { listPantryHandler } from '../../src/tools/list-pantry.js';

describe('list_pantry', () => {
  let db: Db;

  beforeEach(() => {
    db = initDb(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('returns an empty list when the pantry is empty', () => {
    expect(listPantryHandler(db)).toEqual({ items: [] });
  });

  it('returns rows sorted alphabetically by name (case-insensitive)', () => {
    db.exec(
      `INSERT INTO pantry_items (name, quantity, unit) VALUES ('Tomatoes', 3, ''), ('apples', 5, ''), ('Basil', 1, 'g')`,
    );
    const result = listPantryHandler(db);
    expect(result.items.map((i) => i.name)).toEqual(['apples', 'Basil', 'Tomatoes']);
  });

  it('breaks ties on name by created_at (oldest first), then id', () => {
    db.prepare(
      `INSERT INTO pantry_items (name, quantity, unit, created_at) VALUES (?, ?, ?, ?)`,
    ).run('milk', 1, 'L', '2026-05-01T10:00:00Z');
    db.prepare(
      `INSERT INTO pantry_items (name, quantity, unit, created_at) VALUES (?, ?, ?, ?)`,
    ).run('milk', 2, 'L', '2026-05-02T10:00:00Z');

    const result = listPantryHandler(db);
    expect(result.items).toHaveLength(2);
    expect(result.items.map((i) => i.quantity)).toEqual([1, 2]);
  });

  it('returns the full PantryItem shape with id, expiry, and created_at', () => {
    db.prepare(
      `INSERT INTO pantry_items (name, quantity, unit, expiry) VALUES ('milk', 1, 'L', '2026-05-15')`,
    ).run();

    const [item] = listPantryHandler(db).items;
    expect(item).toMatchObject({
      name: 'milk',
      quantity: 1,
      unit: 'L',
      expiry: '2026-05-15',
    });
    expect(item?.id).toBeTypeOf('number');
    expect(item?.created_at).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });

  it('returns expiry as null when the column is NULL', () => {
    db.exec(`INSERT INTO pantry_items (name, quantity, unit) VALUES ('rice', 500, 'g')`);
    const [item] = listPantryHandler(db).items;
    expect(item?.expiry).toBeNull();
  });
});
