#!/usr/bin/env bash
# scripts/bootstrap-issues.sh
#
# Bootstrap the GitHub Issues backlog for Peckish from the build plan.
# Creates the lean label taxonomy and files one issue per MVP work item
# (plus Increment 1, queued ahead of when it's needed).
#
# Idempotent: re-running won't duplicate labels or issues that already exist.
#
# Requires:
#   - gh CLI installed and authenticated (`gh auth status`)
#   - Run from inside the peckish repo (so `gh` picks up the right repo via remote)
#
# Usage:
#   ./scripts/bootstrap-issues.sh
#   ./scripts/bootstrap-issues.sh --dry-run    # show what would happen, no writes

set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

# ────────────────────────────── prelude ──────────────────────────────

require() {
  command -v "$1" >/dev/null 2>&1 || { echo "error: required tool '$1' not found in PATH"; exit 1; }
}
require gh
require git

REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
if [[ -z "$REPO" ]]; then
  echo "error: couldn't resolve the repo. Run this from inside the peckish repo with gh authenticated."
  exit 1
fi

echo "Repo:   $REPO"
echo "Mode:   $([[ $DRY_RUN == true ]] && echo "DRY RUN (no writes)" || echo "live (will create labels and issues)")"
echo

# ────────────────────────────── labels ──────────────────────────────

create_label() {
  local name="$1" color="$2" desc="$3"
  if gh label list --json name -q '.[].name' | grep -Fxq "$name"; then
    echo "  · label exists: $name"
  elif [[ $DRY_RUN == true ]]; then
    echo "  + would create label: $name ($color)"
  else
    gh label create "$name" --color "$color" --description "$desc" >/dev/null
    echo "  + created label: $name"
  fi
}

echo "Labels"
echo "------"

create_label "type:feature"           "1f883d" "New functionality"
create_label "type:bug"               "d1242f" "Something broken"
create_label "type:adr"               "8250df" "Architectural decision record"
create_label "type:eval"              "bf8700" "Eval work"
create_label "type:docs"              "0969da" "Docs, README, guides"
create_label "type:infra"             "656d76" "CI, deploy, tooling"
create_label "increment:mvp"          "0e8a16" "MVP scope"
create_label "increment:1"            "84cc16" "Safety verifier"
create_label "increment:2"            "84cc16" "Memory and feedback"
create_label "increment:3"            "84cc16" "Observability and 4GS"
create_label "increment:4"            "84cc16" "Brand and Vercel landing"
create_label "increment:5"            "84cc16" "Grafana MCP for NLQ"
create_label "increment:6"            "84cc16" "RAG over personal cookbook corpus"
create_label "increment:7"            "84cc16" "Auth and multi-user"
create_label "priority:critical-path" "fb8500" "Must-do for the increment to ship"

echo

# ────────────────────────────── issues ──────────────────────────────

create_issue() {
  local title="$1"; shift
  local body="$1"; shift
  local labels="$1"; shift  # comma-separated

  if gh issue list --state all --search "$title in:title" --json title -q '.[].title' | grep -Fxq "$title"; then
    echo "  · issue exists: $title"
    return
  fi

  if [[ $DRY_RUN == true ]]; then
    echo "  + would create issue: $title  [$labels]"
  else
    gh issue create --title "$title" --body "$body" --label "$labels" >/dev/null
    echo "  + created issue: $title"
  fi
}

echo "Issues"
echo "------"

# ── MVP ───────────────────────

create_issue \
  "Build PantryMCP server with four tools" \
  "**Type:** feature
**Increment:** mvp
**Critical path?** yes

## Description

Build the PantryMCP server with the four tools that back the MVP skill flow:
\`list_pantry\`, \`add_item\`, \`remove_item\`, \`recognise_ingredients(photo)\`.
TypeScript with the official MCP SDK. SQLite for storage. Zod schemas on every
tool boundary. Tests written by Claude with prompts committed alongside.

## Acceptance criteria

- [ ] All four tools implemented with Zod schemas for inputs and outputs
- [ ] SQLite seed data committed (a small starter pantry for demos)
- [ ] Unit tests covering each tool, prompts that produced them committed
- [ ] Coverage at or above the 60% threshold defined in DoD
- [ ] OpenTelemetry traces around every tool call (placeholder ok if span exporter lands later)

## Notes

ADR-002 (model routing — Haiku for vision, Sonnet for recipes) lands alongside the \`recognise_ingredients\` work; create a separate ADR PR if convenient." \
  "type:feature,increment:mvp,priority:critical-path"

create_issue \
  "Build CookFromPantry skill" \
  "**Type:** feature
**Increment:** mvp
**Critical path?** yes

## Description

Write the SKILL.md (description, instructions, voice locked from the brand book,
four-step output format, one worked example). Handle photo OR text input.
Test the trigger across 10+ phrasings (English plus a few French) before calling
the work done.

## Acceptance criteria

- [ ] SKILL.md complete with description, instructions, voice section, output spec
- [ ] Output format matches the spec exactly (three options, name / time / cuisine / used / missing / why)
- [ ] Triggering eval pass rate ≥ 95% on the canonical phrasings
- [ ] One worked example committed under \`packages/skill/examples/\`
- [ ] Skill description changes logged in \`/docs/prompt-history.md\`

## Notes

The voice section is canonical in the brand book v2; don't drift." \
  "type:feature,increment:mvp,priority:critical-path"

create_issue \
  "Model routing — Haiku for vision, Sonnet for recipes (ADR-002)" \
  "**Type:** adr
**Increment:** mvp
**Critical path?** yes

## Description

Wire the model routing so vision-based ingredient recognition runs on Haiku and
recipe generation runs on Sonnet. Capture the rationale and the cost numbers in
ADR-002.

## Acceptance criteria

- [ ] \`recognise_ingredients\` tool calls Haiku
- [ ] Skill recipe generation calls Sonnet
- [ ] ADR-002 committed at \`/docs/adr/0002-model-routing.md\` with cost numbers and the explicit trade-off
- [ ] README references ADR-002 in the *Why it's built this way* section" \
  "type:adr,increment:mvp,priority:critical-path"

create_issue \
  "Implement evals — triggering, quality, photo-accuracy" \
  "**Type:** eval
**Increment:** mvp
**Critical path?** yes

## Description

Build the eval suite. Triggering eval over 10+ phrasings (English + French).
Quality eval over five fixed inventories scored by Claude-as-judge against the
four-point rubric. Photo-accuracy eval over five fridge photos vs ground-truth
ingredients.

Eval results published in the README results table.

## Acceptance criteria

- [ ] Triggering eval at \`/evals/triggering.test.ts\`
- [ ] Quality eval at \`/evals/quality.test.ts\` (rubric: uses-on-hand-ingredients / respects-constraints / time-realistic / instructions-coherent)
- [ ] Photo-accuracy eval at \`/evals/photo-accuracy.test.ts\`
- [ ] Fixtures committed under \`/evals/fixtures/\`
- [ ] Results table rendered in the README

## Notes

CI fails the build if eval pass rate drops below 85% (per DoD)." \
  "type:eval,increment:mvp,priority:critical-path"

create_issue \
  "MVP repo polish — install steps, results, demo gif" \
  "**Type:** docs
**Increment:** mvp
**Critical path?** yes

## Description

Final README polish for the MVP launch moment. Install instructions, eval
results table, ADR references, 30-second demo gif (photo → three dinners),
explicit *what vision is and isn't ready for* caveat.

## Acceptance criteria

- [ ] Install instructions verified by running through them on a clean checkout
- [ ] Eval results table populated with current numbers
- [ ] ADR-001 and ADR-002 linked from README
- [ ] 30-second demo gif embedded
- [ ] Vision limitation caveat included
- [ ] README lints cleanly via markdown-lint" \
  "type:docs,increment:mvp,priority:critical-path"

# ── Increment 1 ──────────────

create_issue \
  "Allergen safety verifier (Increment 1)" \
  "**Type:** feature
**Increment:** 1
**Critical path?** no

## Description

Programmatic allergen check that runs after recipe generation and refuses to
ship a non-compliant recipe. Test fixtures cover adversarial cases — peanuts
vs groundnuts, sesame in tahini, dairy in ghee — so false negatives surface
in CI rather than in production.

The verifier is **programmatic, not LLM-based** — that's the whole point.

## Acceptance criteria

- [ ] Verifier function in TypeScript with Zod-typed input/output
- [ ] Adversarial test fixture set covering at least eight variant-name cases
- [ ] Skill calls verifier before returning a recipe; on fail returns an honest *\"this isn't safe — here's why\"* response
- [ ] Verifier hits logged to the observability dashboard
- [ ] Companion post drafted: *why I don't trust LLMs to keep my kid alive*

## Notes

Risk R-102 in \`/docs/risks.md\` covers false negatives in this verifier — track triggers there." \
  "type:feature,increment:1"

# ────────────────────────────── done ──────────────────────────────

echo
echo "Done. View the backlog:"
echo "  https://github.com/$REPO/issues"
