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

*Next entry lands at end of session 2.*
