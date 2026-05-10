import type { Db } from '../db.js';
import {
  type RemoveItemInput,
  RemoveItemInputSchema,
  type RemoveItemOutput,
  RemoveItemOutputSchema,
} from '../schemas.js';

interface MatchingRow {
  id: number;
  quantity: number;
}

interface SumRow {
  total: number;
}

export function removeItemHandler(db: Db, input: RemoveItemInput): RemoveItemOutput {
  const parsed = RemoveItemInputSchema.parse(input);

  const apply = db.transaction((): RemoveItemOutput => {
    const matches = db
      .prepare(
        `SELECT id, quantity FROM pantry_items
         WHERE name = ?
         ORDER BY datetime(created_at) ASC, id ASC`,
      )
      .all(parsed.name) as MatchingRow[];

    if (matches.length === 0) {
      return { removed: false, remaining_quantity: 0 };
    }

    if (parsed.quantity === undefined) {
      // No quantity given → remove every row matching name.
      db.prepare('DELETE FROM pantry_items WHERE name = ?').run(parsed.name);
      return { removed: true, remaining_quantity: 0 };
    }

    const updateStmt = db.prepare('UPDATE pantry_items SET quantity = ? WHERE id = ?');
    const deleteStmt = db.prepare('DELETE FROM pantry_items WHERE id = ?');
    let toRemove = parsed.quantity;

    for (const row of matches) {
      if (toRemove <= 0) break;
      if (row.quantity > toRemove) {
        updateStmt.run(row.quantity - toRemove, row.id);
        toRemove = 0;
      } else {
        deleteStmt.run(row.id);
        toRemove -= row.quantity;
      }
    }

    const remaining = db
      .prepare('SELECT COALESCE(SUM(quantity), 0) AS total FROM pantry_items WHERE name = ?')
      .get(parsed.name) as SumRow;

    return { removed: true, remaining_quantity: remaining.total };
  });

  return RemoveItemOutputSchema.parse(apply());
}
