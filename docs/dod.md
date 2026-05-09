# Definition of Done

Every PR in this repository must clear the bar below before it can merge. The bar is set deliberately high for a personal project — because the project's job is to demonstrate the engineering discipline of a serious system. Most personal projects skip half of these. The asymmetry is the whole point.

This document is canonical. The PR template references it. CI enforces it where automatable. Reviewers (Claude or human) enforce the rest.

---

## The bar

A PR is Done when, for every applicable category below, the answer is yes.

### Code quality

- [ ] Lint passes
- [ ] Typecheck passes (TypeScript strict mode)
- [ ] No new `TODO` or `FIXME` comments without linked issues
- [ ] No `console.log` or debug statements left in shipped code
- [ ] Functions have explicit return types
- [ ] No `any` types without an inline justification comment

### Testing

- [ ] Unit tests added or updated for new logic
- [ ] All tests pass in CI
- [ ] Coverage at or above the current threshold (starts at 60%, ratchets up — current value lives in `package.json`)
- [ ] If the change touches the skill or MCP, the relevant eval suite was run and results are unchanged or improved

### Documentation

- [ ] README updated for any user-facing change
- [ ] If the change reflects an architectural decision, an ADR is added in `/docs/adr/` and linked in the PR description
- [ ] Conventional commit message format used (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`)
- [ ] Inline comments only where the code can't speak for itself

### Review

- [ ] PR description follows the template (What / Why / Tests / Docs / DoD)
- [ ] Diff under 400 lines, or PR description explains why larger
- [ ] Reviewed — Claude as a first pass via the GitHub MCP, then human
- [ ] Reviewer comments addressed or explicitly deferred to a follow-up issue

### Operations

- [ ] No new third-party dependencies without justification in the PR description
- [ ] No new secrets committed (secret scanner enforces in CI)
- [ ] No regression in observability metrics on existing dashboards
- [ ] If a new env var is introduced, it's documented in the README and in `.env.example`

### AI-specific

- [ ] If the change modifies skill instructions or MCP tool behaviour, eval pass rate is at or above 85%
- [ ] If a new model is selected for any flow, the model-routing decision is documented (existing or new ADR)
- [ ] If the system prompt or skill description is modified, the change is logged in `/docs/prompt-history.md`
- [ ] If the change affects token usage or cost characteristics, the observability dashboard reflects the new baseline

---

## Why this list looks the way it does

The **AI-specific** section is the part that doesn't appear in most engineering teams' DoDs. It's there because AI systems fail in ways traditional software doesn't — silently, semantically, regressively. Standard CI catches the syntactic problems. The AI-specific rules catch the semantic ones.

The **no new TODOs without linked issues** rule enforces that the backlog and the code agree about what work is unfinished. If a TODO can't be linked to an issue, it's not actually planned work — it's hope.

The **400-line PR cap** is empirical. PRs above 400 lines are reviewed less carefully, regress more often, and fragment the audit trail. The cap is soft (PRs can be larger with reason) but the default is small.

The **PR description follows the template** rule exists because the audit trail matters. Future-you, future-team, and the AI-native engineering management post all need PR descriptions that explain *what* and *why*. The template is short; following it is cheap.

---

## When to relax this bar

Never automatically. The bar is the bar. If a particular DoD item doesn't apply (e.g. a docs-only PR doesn't need eval results), say so explicitly in the PR description rather than ignoring the line. The template makes this easy.

## When to ratchet this bar up

The coverage threshold should increase by 5% every two months until it hits 85%. The eval pass-rate floor should increase by 1% every release until it stabilises around 95%. The PR-size cap is fine where it is.

The ratchet is itself a piece of evidence the project is being run, not just shipped.
