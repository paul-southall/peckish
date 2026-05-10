# Prompt — add-item.test.ts

The prompt that produced the sibling test file.

---

Write `tests/tools/add-item.test.ts` covering `addItemHandler` in
`src/tools/add-item.ts`.

Setup:

- `initDb(':memory:')` per test in `beforeEach`. Close in `afterEach`.
- Vitest no-globals (explicit imports per `vitest.config.ts`).

Cases:

1. Happy path — `{ name: 'tomatoes', quantity: 3, unit: '' }` returns a
   `PantryItem` with the same fields plus a runtime `id` and ISO-shaped
   `created_at`. `expiry` is `null` (not `undefined`).
2. Defaults — omitting `quantity` and `unit` produces `quantity: 1`,
   `unit: ''`. The DB schema's `DEFAULT 1` and `DEFAULT ''` carry these.
3. Expiry round-trip — `expiry: '2026-05-15'` persists and is returned.
4. Decisions check — the locked decision is **simple INSERT, no upsert**.
   Two `add_item` calls for `'tomatoes'` produce two rows. Assert by
   counting rows with `WHERE name = 'tomatoes'`.
5. Validation failures — empty `name` throws (Zod `.min(1)`); negative
   `quantity` throws (Zod `.positive()`). The handler re-validates input
   even though the MCP layer also validates, so out-of-MCP callers get the
   same guarantees.

Avoid:

- Mocking the DB. `:memory:` is the real thing and runs in <10 ms per test.
- Snapshot tests on `id` or `created_at` — non-deterministic.
- Asserting on SQL strings.

Style:

- Strict-type-checked ESLint, so unchecked indexed access is banned. Use
  destructuring or `toMatchObject` to narrow.
- Match the prettier defaults — single quotes, 100-col wrap, trailing
  commas.
