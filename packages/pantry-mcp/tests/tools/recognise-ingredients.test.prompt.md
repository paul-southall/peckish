# Prompt — recognise-ingredients.test.ts

The prompt that produced the sibling test file.

---

Write `tests/tools/recognise-ingredients.test.ts` covering
`recogniseIngredientsHandler` in `src/tools/recognise-ingredients.ts`. The
real Anthropic API is **never called** in tests — pass a stubbed
`VisionClient` whose `messages.create` is a `vi.fn()`.

Setup:

- A `makeClient(textResponse)` helper that returns `{ client, create }`
  where `create` is the underlying `vi.fn()` so tests can assert call args.
  The fake response shape mirrors the SDK's `Message` (id, type, role,
  model, content, stop_reason, usage) — only `content[0].text` matters
  functionally; the rest is documentation of the contract.
- A `getFirstUserContent(create)` helper because every "did the request
  shape look right" test reaches into `mock.calls[0][0].messages[0].content`.
  Centralising the cast keeps individual tests readable.

Cases:

1. **Happy path** — JSON text block → parsed `ingredients` array. Two
   items with different `confidence` values to prove the schema accepts
   the full range.
2. **Model selection** — assert the request uses `MODELS.vision` and a
   non-zero `max_tokens`. Also assert the system prompt contains "JSON"
   so we catch accidental prompt edits that drop the JSON-only directive.
3. **Raw base64 → image/jpeg default** — prove the photo passes through
   unchanged and the default media type is `image/jpeg`.
4. **Data URL parsing** — `data:image/png;base64,...` extracts the
   `image/png` media type and strips the prefix. The base64 part lands as
   `data` cleanly.
5. **No filtering** — locked decision: the tool passes confidence scores
   through verbatim. Three items with confidences `[0.95, 0.1, 0.5]` come
   back in the same order, no drops.
6. **No text block** — response with only a `tool_use` block throws with
   a message matching `/text block/`. Tests the early-return path.
7. **Invalid JSON** — `'not valid json {'` text throws.
8. **Wrong shape** — `{ wrong: 'shape' }` text throws Zod validation.

Avoid:

- Calling the real Anthropic API. The handler is the boundary; tests stop
  at `messages.create`.
- Snapshot-testing the system prompt — it'll evolve, and meaningful
  changes get logged in `docs/prompt-history.md` instead.
- Testing the SDK itself (overload resolution, etc.) — assume it works.

Style:

- Strict-type-checked ESLint. The `vi.fn()` stub crosses TS's strict
  typing — minimum cast surface via `as unknown as VisionClient['messages']['create']`
  in one place per test.
- `expect(...).rejects.toThrow()` for async error paths.
- No real fixtures (binary base64 image data) — string literals are fine
  because the test never decodes them.
