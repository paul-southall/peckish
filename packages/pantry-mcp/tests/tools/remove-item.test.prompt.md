# Prompt — remove-item.test.ts

The prompt that produced the sibling test file.

---

Write `tests/tools/remove-item.test.ts` covering `removeItemHandler` in
`src/tools/remove-item.ts`.

Setup:

- `initDb(':memory:')` per test.
- A `seed(name, quantity, createdAt)` helper because the tests need to
  control row ordering by `created_at` to prove FIFO semantics — the DB's
  `DEFAULT CURRENT_TIMESTAMP` would tie all rows in a single test run.
- A `totalFor(name)` helper because tests assert against the SUM rather
  than mocking the read path.

Cases:

1. **No matching rows** — returns `{ removed: false, remaining_quantity: 0 }`.
2. **Quantity omitted** — removes every row with that name. Other names
   left alone.
3. **Partial decrement** — `quantity: 2` against a single row of 5 leaves
   3 remaining, returns `remaining_quantity: 3`.
4. **FIFO across rows** — two rows for the same name, oldest first
   (`created_at` ASC). Removing 3 from rows of [2, 5] should delete the
   first row entirely and decrement the second to 4. Verify by inspecting
   surviving rows directly.
5. **Over-removal** — requesting more than the total deletes everything
   matching, no error.
6. **Validation** — negative `quantity` throws (Zod `.positive()`).

Avoid:

- Mocking the DB.
- Asserting on transaction semantics (`db.transaction`) — implementation
  detail. Just verify the visible state changes.
- Time-based assertions on `created_at`.

Style:

- Strict ESLint, strict TS. No unchecked indexed access — use `.toEqual`
  with full row objects rather than indexing into arrays.
- Zod's `.parse()` errors come through as plain `Error`s; just assert
  `.toThrow()` without pinning the message.
