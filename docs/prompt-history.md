# Prompt history

Changes to the skill `description:` field, system prompts, and other prompt-shaped strings are logged here with the date, the change, and the reason. The Definition of Done requires this log to be updated for every prompt change.

The point: prompt changes are silent regressions waiting to happen. Logging them makes the regression history visible and recoverable.

---

## 2026-05-10 — `recognise_ingredients` system prompt (initial)

**File:** [packages/pantry-mcp/src/tools/recognise-ingredients.ts](../packages/pantry-mcp/src/tools/recognise-ingredients.ts)

**Change:** First iteration of the system prompt for the
`recognise_ingredients` MCP tool. Asks Haiku to identify ingredients in a
fridge or pantry photo and return a strict JSON object with per-item
`name`, `confidence`, optional `quantity`, optional `unit`. Explicit
"return ONLY JSON, no prose, no markdown, no preamble" directive at the
end to prevent markdown-wrapping that would break `JSON.parse`.

**Why this shape.** The skill's contract (per
[SKILL.md](../packages/skill/SKILL.md)) keeps the *honest about
uncertainty* line — calibrated against the brand-book voice. So the
prompt explicitly tells the model when to lower confidence (occlusion,
opaque containers, poor lighting, guessing rather than seeing). The
filtering decision is **at the skill layer**, not the tool — confidence
scores pass through unfiltered (locked decision, plan 2026-05-10).

**Eval status.** No formal eval yet — fixtures and rubric land with issue
[#4](https://github.com/paul-southall/peckish/issues/4). For now, manual
smoke testing against real fridge photos during the tool-implementation
PR's verification step.

---

*First entry above. Future entries land when the skill `description:` or
any system prompt is iterated.*
