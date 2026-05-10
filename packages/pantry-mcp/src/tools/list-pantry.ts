import type { Db } from '../db.js';
import { type ListPantryOutput, PantryItemSchema } from '../schemas.js';

export function listPantryHandler(db: Db): ListPantryOutput {
  const rows = db
    .prepare(
      'SELECT id, name, quantity, unit, expiry, created_at FROM pantry_items ORDER BY name COLLATE NOCASE, datetime(created_at), id',
    )
    .all();
  const items = rows.map((row) => PantryItemSchema.parse(row));
  return { items };
}
