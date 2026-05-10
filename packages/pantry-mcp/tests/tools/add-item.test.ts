import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { initDb, type Db } from '../../src/db.js';
import { addItemHandler } from '../../src/tools/add-item.js';

describe('add_item', () => {
  let db: Db;

  beforeEach(() => {
    db = initDb(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('inserts a row and returns the persisted PantryItem', () => {
    const result = addItemHandler(db, { name: 'tomatoes', quantity: 3, unit: '' });
    expect(result).toMatchObject({
      name: 'tomatoes',
      quantity: 3,
      unit: '',
      expiry: null,
    });
    expect(result.id).toBeTypeOf('number');
    expect(result.created_at).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });

  it('defaults quantity to 1 when omitted', () => {
    const result = addItemHandler(db, { name: 'lemon' });
    expect(result.quantity).toBe(1);
    expect(result.unit).toBe('');
  });

  it('persists expiry when provided', () => {
    const result = addItemHandler(db, {
      name: 'milk',
      quantity: 1,
      unit: 'L',
      expiry: '2026-05-15',
    });
    expect(result.expiry).toBe('2026-05-15');
  });

  it('per the simple-INSERT decision, two adds of the same name produce two rows', () => {
    addItemHandler(db, { name: 'tomatoes', quantity: 3 });
    addItemHandler(db, { name: 'tomatoes', quantity: 2 });

    const count = db
      .prepare('SELECT COUNT(*) as n FROM pantry_items WHERE name = ?')
      .get('tomatoes') as { n: number };
    expect(count.n).toBe(2);
  });

  it('rejects empty names at the schema boundary', () => {
    expect(() => addItemHandler(db, { name: '' })).toThrow();
  });

  it('rejects negative quantities', () => {
    expect(() => addItemHandler(db, { name: 'rice', quantity: -1 })).toThrow();
  });
});
