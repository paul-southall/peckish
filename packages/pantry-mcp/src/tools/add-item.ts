import type { Db } from '../db.js';
import {
  type AddItemInput,
  AddItemInputSchema,
  type AddItemOutput,
  AddItemOutputSchema,
} from '../schemas.js';

export function addItemHandler(db: Db, input: AddItemInput): AddItemOutput {
  const parsed = AddItemInputSchema.parse(input);
  const row = db
    .prepare(
      `INSERT INTO pantry_items (name, quantity, unit, expiry)
       VALUES (?, ?, ?, ?)
       RETURNING id, name, quantity, unit, expiry, created_at`,
    )
    .get(parsed.name, parsed.quantity ?? 1, parsed.unit ?? '', parsed.expiry ?? null);
  return AddItemOutputSchema.parse(row);
}
