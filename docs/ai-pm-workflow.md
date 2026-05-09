# AI-native project management workflow

## What this is

A practical specification of how Claude and the GitHub MCP are used to project-manage Peckish end-to-end. Documented because the workflow is itself a contribution to the AI engineering conversation — most people who talk about *AI-native project management* haven't actually run a project this way, and the only credible artefact is one written from inside the experience.

This document is canonical. `CONTRIBUTING.md` links to it. The bootstrap prompt references it. Every increment refines it.

## Principles

**Claude drafts. Humans decide.** Every action below has Claude producing a first version and a human reviewing before commit. Claude is a fast typist with good defaults — not a decision-maker.

**Audit trail over comfort.** Every issue, status change, PR description, and release note goes through the GitHub MCP rather than the GitHub UI, even when the UI would be marginally faster. The audit trail is the artefact.

**No private data through tools.** Voice memos, dev-journal entries, and PR contexts must not include personal information that shouldn't end up in commit history. The human reviews for this before any of those flows commit.

**The doc adapts to the practice.** This file is updated whenever a loop changes shape. If a workflow consistently isn't followed, fix the doc rather than ignore it.

---

## The recurring loops

### Loop 1 — Issue creation from the build plan

**When.** At the start of every increment, and any time scope changes meaningfully.

**Claude.** Reads the relevant section of the build plan, drafts issues following the issue template, applies labels (`type:*`, `increment:*`, `priority:critical-path`), files them through the GitHub MCP, places them in Backlog.

**Human.** Reviews the issues for clarity, edits acceptance criteria, deletes anything that turned out to be unnecessary.

**Canonical prompt:**

> You have access to the GitHub MCP for `paulsouthall/peckish`, and the build plan is attached. Read the [SECTION] of the plan and create one issue per work item in Backlog. Use the default issue template. Apply `type:*` and `increment:*` labels. Apply `priority:critical-path` where the plan flags it. Flag any work items where acceptance criteria felt unclear and needed inference.

### Loop 2 — Issue creation from voice memos and the journal

**When.** Ad-hoc throughout the build.

**Claude.** Given a voice-memo transcript or a journal entry, identifies discrete work items (bugs, features, follow-ups) and files issues for each through the GitHub MCP, with labels.

**Human.** Speaks the memo or writes the journal entry, then reviews the resulting issues.

**Pattern.** Hand Claude the transcript or entry. Ask: *Identify any work items in this and file them as issues, following the standard issue template. Be conservative — when in doubt, don't file.*

### Loop 3 — Status transitions

**When.** Every time an issue starts (Backlog → In Progress) or finishes (In Progress → Done).

**Claude.** Updates the Project board column through the GitHub MCP. Adds a brief progress comment to the issue if relevant.

**Human.** Tells Claude to make the move, or asks Claude to scan for stale In-Progress items at the end of a session.

**Why through Claude.** Two reasons. The audit trail accumulates without manual board fiddling. And asking Claude *"what's been moved this week?"* later is cleaner than reconstructing from the GitHub UI.

### Loop 4 — PR description authoring

**When.** Every PR.

**Claude.** Given the diff, drafts a PR description following the PR template (What / Why / Tests / Docs / DoD), links the closing issue, posts through the GitHub MCP.

**Human.** Reviews the description, edits the *Why* if Claude's inference was off, ticks the DoD boxes that actually apply.

**Why this matters.** PR descriptions are the audit trail of *intent*. Most personal projects skip them or write one-liners. Having Claude produce a real description from the diff means every PR in the history has one — which makes the eventual *AI-native engineering management* post credible and the codebase easier for any future contributor to navigate.

### Loop 5 — Release notes and changelog

**When.** End of every increment (roughly weekly).

**Claude.** Reads commits between the last release tag and HEAD, drafts release notes grouped by `type:*` from the conventional-commit prefixes, files a GitHub Release, updates `CHANGELOG.md`.

**Human.** Reviews for accuracy, especially the *highlights* section. Tags the release.

**Pattern.** *List commits since [last tag] and draft release notes following the conventional-commit grouping. Surface the three most significant changes as highlights at the top.*

### Loop 6 — Weekly review and journal entry

**When.** End of every weekend session.

**Claude.** Given the week's commits, closed issues, and PR descriptions, drafts a single journal entry: *what shipped*, *what didn't*, *what got harder than expected*, *what to focus on next session*.

**Human.** Reviews and adds the things Claude can't see — frustration, context, the messy bits. Commits the entry to `/docs/journal.md`.

**Why both halves.** The clean summary comes from the audit trail Claude has access to. The texture — *the trigger phrasing was misfiring on French inputs and I almost gave up* — comes from the human. Both are valuable; only the second is rare in public.

### Loop 7 — Backlog grooming

**When.** Start of every weekend session.

**Claude.** Reads the Backlog, the most recent journal entry, and the build plan. Surfaces issues that look stale, duplicated, or mis-prioritised, and proposes specific changes.

**Human.** Approves or rejects each proposed change.

**Pattern.** *Review the Backlog against the build plan and the most recent journal entry. Flag anything that looks stale, duplicated, or mis-prioritised. Don't make changes — propose them.*

---

## Boundaries — what Claude never does

- **Closes issues unilaterally.** Closure goes through PR merges (which require human approval) or explicit human instruction.
- **Edits acceptance criteria after they're set.** New criteria only. Changes go through the human.
- **Deletes issues.** Stale ones get closed with a comment explaining why.
- **Authors the launch post or the deep-dive content.** Those are human-voice work; Claude can edit and tighten but does not draft.
- **Pushes directly to `main`.** All changes go through PRs, even one-line changes.

---

## When this workflow breaks down

It will break in at least three predictable ways. Each has a fix.

**Claude drifts on issue scoping.** Acceptance criteria get vaguer over time, issues get larger. Fix: one weekend in three is a *grooming weekend* where the human re-tightens the standard, even at the cost of velocity.

**The audit trail floods.** Too many small issues, too many trivial PRs, the board becomes hard to read. Fix: tighten what counts as worth-an-issue. Spelling fixes don't get issues; behavioural changes do.

**The workflow becomes theatre.** Issues get filed, statuses move, but the human stops looking at any of it. Fix: the workflow is a means to a launch-post, not the post itself. If it stops producing useful artefacts, simplify aggressively.

---

This document is itself the kind of artefact most engineering teams haven't written for their AI workflows — partly because the practice is too new, partly because writing it requires having actually done it. The version above will be wrong in places by Increment 3. Update it as that becomes clear, and treat the diff between versions as content for the eventual *AI-native engineering management* post.
