# Build journal

Weekly entries from inside the build. Entries land at the end of every weekend session — what shipped, what didn't, what got harder than expected, what to focus on next session. The clean summary comes from the audit trail; the texture comes from the human.

The point of writing this in public is the texture.

---

## 2026-05-09 — Session 1: foundation, brand, backlog

### What shipped

The repo went from nothing to publicly live on GitHub at `paul-southall/peckish` in a single afternoon, across three commits that each represent a discrete chunk of foundation work:

- **`chore: initial scaffold`** — README, LICENSE (MIT), CONTRIBUTING, `.gitignore`, `.env.example`, CHANGELOG, and the full `/docs/` tree: ADR-001 (MCP plus skill rather than a chat wrapper), the Definition of Done, the AI-native PM workflow spec, the risk register, plus placeholder files for the journal, failure log, and prompt history. A starter `SKILL.md` with one worked example. GitHub issue and PR templates.
- **`feat(brand): add Peckish brand assets v2`** — the locked *Citrus / Sprout* brand book translated into a `/brand/` folder: six logo SVGs, three lockup SVGs, three OG card SVGs (all with `<title>Peckish</title>` injected so screen readers don't read the dotless *Peckısh* aloud), the full favicon and app-icon set, the launch card HTML and PNG. README tagline replaced with the locked primary — *"Stop staring at the fridge."* `SKILL.md` voice section replaced with the locked do/don't list from the brand book.
- **`feat(scripts): bootstrap MVP issues from build plan`** — a bash script using `gh` CLI to create the 15-label taxonomy and file the six issues (five MVP, one Increment 1) that scope out next weekend's work. Idempotent so it can be re-run.

The GitHub repo's social-preview card is set to `og-B-markled.png`. The Issues backlog has six issues sitting in it, properly labelled and ready to be moved into a Project board next session.

### What didn't ship — and why it didn't bite

The original plan called for the **GitHub MCP** to drive issue creation from inside Claude. That fell over: the GitHub MCP at the Cowork session level couldn't authenticate (dynamic client registration unsupported, the `/mcp` slash command resolves as an unknown skill in Cowork). The fallback was a bash script using my existing `gh` CLI auth — which is arguably a *better* launch-post artefact than driving it through the MCP would have been. *"I bootstrapped my project's backlog with a single bash script Claude wrote."*

> _\[texture: anything else you wanted to ship and didn't, anything that got pushed to next session\]_

### What got harder than expected

**The bash sandbox can't write to `.git/`.** Every commit attempt from the sandbox left a stuck `index.lock` that needed `rm -f` from my own terminal before VS Code's commit button worked. Workflow's now clean: Claude authors files, I commit via VS Code. Cleaner separation anyway.

**Headless PNG rendering wasn't possible from the sandbox.** Allowlisted network access doesn't reach the Chromium CDN that puppeteer downloads from. Fell back to user-driven `Cmd+Shift+4` in Chrome — works fine, but adds a manual step to any future *"render this asset"* workflow.

**Claude Design's first asset round dropped the wordmark text entirely.** Logos were empty viewBoxes; lockups and OG cards had the icon but no text. A second round with a corrective prompt (specifically asking for *outline text to paths*) brought the text back — but as `<text>` elements referencing Fraunces rather than outlined paths. Partial fix accepted with the portability caveat written into `/brand/README.md`: SVGs render correctly anywhere Fraunces loads, and PNG exports cover the contexts where it doesn't.

> _\[texture: any moment of friction, any decision you'd revisit, any frustration worth being honest about\]_

### The call I'd defend

Choosing the bash-script-with-`gh` path over fighting the GitHub MCP wiring. Script is committed in the repo, becomes part of the launch story, and stayed within today's session rather than spilling into a debugging rabbit-hole that probably wouldn't have resolved cleanly. Sometimes the right tool is the one that already works.

The other defensible call: accepting the *Citrus Pop* palette as a deliberate v2 departure from the brief's terracotta suggestion. The brand book's reasoning — *cookbook bright, not foodtech bright* — is sharp, and insisting on terracotta would have produced a worse brand.

> _\[texture: anything else you'd publicly defend, anything you'd take a different angle on\]_

### Next session

Phase 1: **PantryMCP server, first three tools** (`list_pantry`, `add_item`, `remove_item`). TypeScript with the official MCP SDK, SQLite, Zod schemas, AI-written unit tests with prompts committed alongside. Three to five hours of code. Then the vision tool (`recognise_ingredients`) plus ADR-002 (*model routing — Haiku for vision, Sonnet for recipes*), another two hours.

Issues 1 and 3 from the backlog move from Backlog to In Progress as the session starts.

---

## 2026-05-10 — Session 2: tools, ADR-002, and the first end-to-end smoke

### What shipped

Two PRs merged, both with proper audit trails this time.

- **PR #7 — `scaffold(pantry-mcp): initialise package, dependencies, db schema`.** The TypeScript backbone: pnpm workspaces, ESLint 9 flat config, Prettier, EditorConfig, `tsconfig.base.json` strict, Node 22 pinned, CI on every push, the MCP-server skeleton on top of an initialised SQLite database. Booted with zero tools registered — deliberate split between *the scaffold is sound* and *the tools work*.
- **PR #8 — `feat(pantry-mcp): four MCP tools + ADR-002 model routing`.** The four tools the skill expects (`list_pantry`, `add_item`, `remove_item`, `recognise_ingredients`), each with its own `tests/tools/<name>.test.ts` and a sibling `.test.prompt.md` capturing the prompt that produced it. ADR-002 locking Haiku for vision and Sonnet for recipes. Coverage gate at 60%, currently sitting at 93 / 97 / 87 / 94 (statements / branches / functions / lines). 44 tests, ~300 ms.

The audit-trail story tightened mid-session. The first PR went up with a commit message stacked on top of the empty PR template — sub-grade for a project whose whole positioning is *AI-native engineering management with proper PR descriptions*. Fixed by drafting the title and body inside the plan file and applying via `gh pr edit`. Same correction landed on PR #8 before merge. Pattern locked: Claude drafts the PR description as part of the plan, not after the diff is in.

### The smoke test, end-to-end

First fridge photo through the full pipeline, against Haiku 4.5 in the real Claude Desktop. The headline: it worked, and it worked better than the brand book's *"honest about what vision is and isn't ready for"* line implied.

- **Brand-name reading.** Vision picked up *Chobani Cookies'n'Cream, Vaalia, Farmers Union strawberry* — specific labels, not categories. Update prior on what Haiku 4.5 multimodal can do on real-world fridge clutter.
- **Calibrated hedging surfaced as user-visible uncertainty.** *"what looks like chocolate bars"*, *"what appears to be a sauce/dressing bottle"*, *"if that block cheese is parmesan or similar"*, *"hard to tell"* on red items. The system prompt's *lower the confidence when occluded / opaque container / guessing* directive landed all the way through to the response.
- **Tool composition working.** *"Combined with the 200g of pasta already in your pantry"* — `list_pantry` and `recognise_ingredients` both called in one turn, results woven together. Two MCP round-trips in one response, both succeeding.
- **Three meaningfully different recipes proposed.** One-pan bake, minimal cacio e pepe, plated with sides — the SKILL.md *three meaningfully different* contract working in the wild even though the skill isn't formally registered yet.

> _\[texture: how the smoke test actually felt — was anything striking, anything that felt off, the bit you'd quote in a launch post\]_

### What didn't ship — and why it didn't bite

- **Skill registration.** `packages/skill/SKILL.md` is markdown on disk but not yet a registered Claude skill. The smoke test got the structured-output behaviour anyway because Claude orchestrated the MCP tools directly with its own presentation logic. Lands with issue #2 in a future session.
- **Eval suite.** Triggering, quality, photo-accuracy — issue #4. Not in this session's scope.
- **Allergen verifier.** Increment 1 territory.

The output-format gap is the visible one: SKILL.md specifies a strict `**Option 1 — [Name]** / ~X minutes · [cuisine] / Uses / Missing / Why tonight` shape, and the smoke test produced friendly prose instead. That's expected pre-skill-registration but worth naming so it's not a surprise later.

### What got harder than expected

- **pnpm/action-setup@v4 → v6 mid-PR.** v4's self-installer doesn't handle pnpm 11 — CI failed with *"Something went wrong, self-installer exits with code 1"*. One-line bump to `@v6` fixed it. Lesson: GitHub Actions pinned versions go stale faster than the underlying tools they wrap.
- **pnpm 11's `allowBuilds` security gate.** Native modules (`better-sqlite3`, `esbuild`) need explicit approval in `pnpm-workspace.yaml`. First install completed without running the install scripts, so `better-sqlite3` had no native binding. Required `rm -rf node_modules && pnpm install` to re-trigger after approval.
- **Strict-type-checked ESLint vs vitest's `expect.stringMatching` returning `any`.** Triggered `no-unsafe-assignment` whichever way the cast went. Refactored the test to split the structural assertion from the regex assertion. Cleaner anyway.
- **Coverage gate caught utility modules at 0%.** `log.ts`, `paths.ts`, `anthropic.ts` weren't exercised by tool tests. Added quick standalone tests; coverage jumped from 52% functions to 87%. The discipline is right, the surprise was just *the gate fires immediately, not gradually*.

> _\[texture: any moment of friction you'd want to be honest about, anything that almost made you walk away\]_

### The call I'd defend

Splitting scaffold from tool implementation into two PRs rather than one ~600-line mixed-shape PR. The audit trail benefits — a reviewer can hold *the foundation is sound* and *the tools work* in their head as separate questions. Two clean commits on `main` is worth more than one tidy merge.

The other defensible call: pass-through confidence on `recognise_ingredients` rather than filtering at the tool boundary. The smoke test made it land — *"if that block cheese is parmesan"* is exactly the conditional surfacing that wouldn't have happened with a 0.4 confidence threshold dropping the row silently. Data layer stays raw, presentation logic stays in the skill, and the system is honest about what it sees.

> _\[texture: anything else you'd publicly defend, or anything you'd take a different angle on\]_

### Next session

Issue #2 — **Build CookFromPantry skill** — so the structured-output format SKILL.md specifies actually lands at runtime. That closes the visible gap from the smoke test. Probably alongside issue #5 (README polish + demo gif of the smoke-test flow) and the start of issue #4 (eval scaffolding).

Worth recording the smoke-test response itself somewhere (probably a `_planning/smoke-tests/` directory, gitignored or scrubbed of identifying details before commit). It'll be the strongest single artefact for the eventual launch-week post.

Issues #1 and #3 are now closed by PR #8.

---

*Next entry lands at end of session 3.*
