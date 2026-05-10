import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { initDb, type Db } from '../../src/db.js';
import { removeItemHandler } from '../../src/tools/remove-item.js';

describe('remove_item', () => {
  let db: Db;

  beforeEach(() => {
    db = initDb(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  function seed(name: string, quantity: number, createdAt: string): void {
    db.prepare(
      `INSERT INTO pantry_items (name, quantity, unit, created_at) VALUES (?, ?, ?, ?)`,
    ).run(name, quantity, '', createdAt);
  }

  function totalFor(name: string): number {
    const row = db
      .prepare('SELECT COALESCE(SUM(quantity), 0) AS total FROM pantry_items WHERE name = ?')
      .get(name) as { total: number };
    return row.total;
  }

  it('returns removed:false when no rows match the name', () => {
    expect(removeItemHandler(db, { name: 'tomatoes' })).toEqual({
      removed: false,
      remaining_quantity: 0,
    });
  });

  it('removes every row matching name when quantity is omitted', () => {
    seed('tomatoes', 3, '2026-05-01T10:00:00Z');
    seed('tomatoes', 5, '2026-05-02T10:00:00Z');
    seed('basil', 1, '2026-05-01T10:00:00Z');

    expect(removeItemHandler(db, { name: 'tomatoes' })).toEqual({
      removed: true,
      remaining_quantity: 0,
    });
    expect(totalFor('tomatoes')).toBe(0);
    expect(totalFor('basil')).toBe(1);
  });

  it('decrements a single row when quantity < row.quantity', () => {
    seed('tomatoes', 5, '2026-05-01T10:00:00Z');

    expect(removeItemHandler(db, { name: 'tomatoes', quantity: 2 })).toEqual({
      removed: true,
      remaining_quantity: 3,
    });
    expect(totalFor('tomatoes')).toBe(3);
  });

  it('FIFO: removes from the oldest row first when multiple rows match', () => {
    seed('tomatoes', 2, '2026-05-01T10:00:00Z');
    seed('tomatoes', 5, '2026-05-02T10:00:00Z');

    // Remove 3: deletes the 2-row entirely, decrements the 5-row by 1.
    expect(removeItemHandler(db, { name: 'tomatoes', quantity: 3 })).toEqual({
      removed: true,
      remaining_quantity: 4,
    });

    const rows = db
      .prepare('SELECT quantity FROM pantry_items WHERE name = ? ORDER BY datetime(created_at)')
      .all('tomatoes') as { quantity: number }[];
    expect(rows).toEqual([{ quantity: 4 }]);
  });

  it('removes everything if requested quantity exceeds total available', () => {
    seed('tomatoes', 2, '2026-05-01T10:00:00Z');
    seed('tomatoes', 1, '2026-05-02T10:00:00Z');

    expect(removeItemHandler(db, { name: 'tomatoes', quantity: 100 })).toEqual({
      removed: true,
      remaining_quantity: 0,
    });
    expect(totalFor('tomatoes')).toBe(0);
  });

  it('rejects negative quantities at the schema boundary', () => {
    expect(() => removeItemHandler(db, { name: 'tomatoes', quantity: -1 })).toThrow();
  });
});
