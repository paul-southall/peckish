# ADR-002: Model routing — Haiku for vision, Sonnet for recipes

**Status:** Accepted
**Date:** 2026-05-10
**Decision-maker:** Paul Southall

## Context

Peckish has two distinct AI workloads with materially different cost and
quality profiles:

1. **Ingredient recognition from a fridge photo.** High-volume per session
   (every photo taken), perception-bound (identify what's there, not reason
   about it), tolerant of a small accuracy hit because the skill keeps text
   input as a first-class fallback per [ADR-001](0001-mcp-skill-not-chat-wrapper.md).
2. **Recipe generation from a pantry inventory.** Low-volume (1–3 calls per
   session), reasoning-bound (the three-options output relies on the model
   weighing time, complexity, and ingredient combinations), quality-sensitive
   because this is the user-facing payload.

Choosing one model for both wastes either money or quality, depending on
which way the choice cuts. Choosing per-task lets each workload land where
it belongs on the price/performance frontier.

## Decision

Route per task:

- **`recognise_ingredients` (MCP tool, this PR) → `claude-haiku-4-5-20251001`.**
  Cheap, fast, multimodal-capable.
- **Recipe generation (skill side, future PR) → `claude-sonnet-4-6`.**
  Better reasoning per token, accepted higher cost given low volume.

Both model IDs live in a single
[`src/models.ts`](../../packages/pantry-mcp/src/models.ts) constant:

```ts
export const MODELS = {
  vision: 'claude-haiku-4-5-20251001',
  recipes: 'claude-sonnet-4-6',
} as const;
```

When Anthropic releases a new generation, swap the constants in this one
file and the rest of the project tracks automatically.

## Cost reasoning

Order-of-magnitude figures at current pricing, personal-use scale (~30
sessions per month, two photos per session, one recipe generation per
session).

| Workload | Model | Per-call rough cost | Monthly |
|---|---|---|---|
| Ingredient recognition | Haiku 4.5 | ~$0.001 (1k input tokens incl. image, ~250 output) | ~$0.06 |
| Recipe generation | Sonnet 4.6 | ~$0.02 (~3k input incl. system prompt, ~800 output) | ~$0.60 |

Total monthly bill at this scale: well under a dollar. The point isn't the
absolute amount — it's that the *ratio* of vision-spend to recipe-spend
shifts in our favour with this routing. Sonnet-everywhere would 5× the
vision cost without measurably better identification of common kitchen
ingredients. Haiku-everywhere would noticeably degrade the recipe-options
quality, which is the user-visible payload.

These numbers are deliberately rough. Real telemetry lands with the
observability work in Increment 3, after which the expected/actual gap
becomes visible in the Grafana dashboard rather than asserted here.

## Alternatives rejected

### Opus for either

Overkill on both axes. Vision tasks don't need Opus's reasoning depth, and
recipe gen at three-options scale is well within Sonnet's competence.
Opus's cost per session would dominate the monthly bill without producing a
correspondingly better product.

### Sonnet for vision

3–5× the cost of Haiku per image with no measurable accuracy gain on real
fridge photos in informal testing during scaffold week. The dominant
failure mode in vision (occluded items, opaque containers) isn't a
reasoning problem; it's an information-availability problem that no model
solves reliably.

### Haiku for recipes

Acceptable in isolation, but the skill's contract is **three meaningfully
different dinner options** with distinct cuisines, complexity levels, and
time budgets. Sonnet generates that variety more reliably; Haiku tends
toward three variations of the same dish unless prompted aggressively.
Recipe gen is low-volume enough that Sonnet's cost is comfortably
absorbed.

## Consequences

**Positive.**

Cost-aligned routing is itself a published artefact — the *Why I routed
between Haiku and Sonnet on a multimodal agent* post in the launch
sequence draws directly from this ADR with real numbers attached.

Single-file model swap when a new generation lands. The `MODELS` constant
is the only place that knows the names.

The skill's text-input fallback (ADR-001) absorbs the residual vision
accuracy gap. Nobody hits a dead end because Haiku misidentified a
tomato — the user can type "I have eggs, tomatoes, leftover pasta" and
Sonnet generates recipes from that just as well.

**Negative / risks.**

Two-model surface is more to monitor than one. Mitigated by the
observability work in Increment 3, where token usage and latency split
out per-model in the Grafana dashboard.

Anthropic could deprecate either model. Mitigated by the single-file
constant — the swap is a one-line PR with no behavioural changes
elsewhere. Risk-register entry **R-005** (cost spike) covers the
adjacent cost-side of this same risk.

## Related decisions

- [ADR-001](0001-mcp-skill-not-chat-wrapper.md) — Skill + MCP form factor.
  The text-input fallback path lives in the skill, not the MCP, and is
  what makes the cheaper-model-for-vision choice safe.
- [ADR-003](0003-mcp-server-stack.md) — Stack and dependencies.
  `@anthropic-ai/sdk` is the only client library in the dep set; this ADR
  is what justifies its place.
- *ADR-TBD — Prompt caching strategy.* Once the recipe-gen system prompt
  stabilises, prompt caching on the static prefix becomes worth the wiring.
  Increment 3 territory.

Closes [#3](https://github.com/paul-southall/peckish/issues/3).
