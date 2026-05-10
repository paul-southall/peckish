# Prompt — list-pantry.test.ts

The prompt that produced the sibling test file. Committed per
`docs/ai-pm-workflow.md` so the *AI in the loop dev workflow* post can show
the prompts alongside their outputs.

---

Write `tests/tools/list-pantry.test.ts` covering the `listPantryHandler` in
`src/tools/list-pantry.ts`.

Setup:

- Use `initDb(':memory:')` from `src/db.ts` in `beforeEach` — fresh schema
  per test, no fixtures needed.
- `afterEach` closes the DB to prove no implicit shared state.
- Vitest, no globals — import `describe`, `it`, `expect`, `beforeEach`,
  `afterEach` explicitly to match `vitest.config.ts` (`globals: false`).

Cases:

1. Empty DB returns `{ items: [] }`.
2. Multiple rows return sorted alphabetically by `name`, **case-insensitive**
   (`apples` before `Basil` before `Tomatoes` — not the default ASCII order).
3. Same name, different `created_at`: oldest first, then by `id`. This pins
   the FIFO ordering that `remove_item` will rely on later.
4. Full `PantryItem` shape — assert via `toMatchObject` so all required
   fields (`id`, `name`, `quantity`, `unit`, `expiry`, `created_at`) are
   surfaced. Allow `id` and `created_at` to be runtime-generated.
5. NULL `expiry` returns as JavaScript `null`, not `undefined` — the schema
   is `z.string().nullable()` and Zod must round-trip that correctly.

Avoid:

- Asserting on the SQL query string. Test behaviour, not implementation.
- Mocking `better-sqlite3`. Real DB at `:memory:` is fast and authoritative.
- Snapshot tests. Brittle for time-stamped rows.

Style:

- Follow the project's prettier config (single quotes, 100-col wrap, semis).
- Strict-type-checked ESLint is on, so no `any` and no unchecked array
  indexing — use destructuring or `toMatchObject` to narrow.
