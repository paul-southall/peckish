# ADR-001: MCP server plus agent skill, not a chat wrapper

**Status:** Accepted
**Date:** 2026-05-09
**Decision-maker:** Paul Southall

## Context

Peckish — a personal AI cooking assistant that takes a photo of a fridge and recommends three dinners — could be built in three broadly different shapes:

1. A standalone web or mobile chat application that calls the Anthropic API directly, with a custom UI and bespoke prompts.
2. A Claude agent skill that runs inside any MCP-aware Claude surface (Desktop, Code, third-party clients), backed by a server that owns persistent state.
3. A combination: a skill plus an MCP server as the engineered core, with a thin web demo wrapping the same backend for casual visitors.

The decision determines the entire architecture, the project's reach, and the engineering signal it sends.

## Decision

Build the engineered core as a **Claude agent skill plus an MCP server**. Add a thin web demo as a marketing surface only — not the primary product.

The skill orchestrates intent. The MCP server owns persistent state (pantry inventory, dietary profiles, meal history). The two communicate through MCP's tool-call protocol. A separate Vercel-hosted web app provides a demo experience for visitors who don't run an MCP-aware client; that demo calls the same backend via Vercel Edge Functions, with no duplicate logic.

## Options considered

### Option 1 — Standalone chat wrapper

A custom web or mobile chat app calling the Anthropic API directly, owning the entire UX.

*Pros.* Maximum design control. Maximum audience reach — anyone with a browser can use it. A clean monetisation path if the project ever becomes a product.

*Cons.* Reinvents what Claude already provides as a chat surface. Locks usage into one app. Sends the wrong engineering signal — "I built another wrapper" is not differentiating in 2026; the bar has moved. Architectural decisions become invisible inside an opaque app rather than legible in a public repo.

### Option 2 — Skill plus MCP server only

The engineered version of Peckish, with no marketing surface.

*Pros.* Clean separation of concerns: state in the MCP, intent in the skill. Reusable — any MCP-aware client can use Peckish without code changes. Sends a clear engineering signal: I understand and use the composition primitives the broader ecosystem is standardising on.

*Cons.* Zero discoverability for non-technical visitors. The audience that can actually try the product is narrow. The launch post has nothing demo-able for a non-Claude user.

### Option 3 — Skill plus MCP plus thin web demo (chosen)

The engineered core from Option 2, wrapped by a single-page Vercel demo that calls the same backend via Edge Functions.

*Pros.* Keeps the architectural integrity of Option 2 — the skill and MCP are first-class, and the web demo reuses them rather than duplicating logic. Adds the discoverability of Option 1 without the lock-in. Lets the launch post say "play with it here" while the README says "install it in your own Claude."

*Cons.* Two surfaces to maintain. Slightly more total work. Risk that the demo gets the audience while the engineered core gets ignored — mitigated by leading every piece of communication with the architecture, not the demo.

## Consequences

**Positive.**

The project is reusable across every Claude surface, present and future. New clients are zero-cost wins.

The engineering work is *legible*: the MCP tools have explicit schemas, the skill's instructions live in a single Markdown file, the architectural decisions live in this directory. Anyone evaluating the work can see what was built and why without needing access to the running app.

The skill description is declarative — Claude decides when to reach for the skill based on user intent. This is a fundamentally different design pattern from a hardcoded chat UI, and it's the pattern the ecosystem is moving toward.

**Negative / risks.**

Discoverability for non-Claude users depends entirely on the web demo holding up. If the demo breaks or the API quota lapses, casual visitors hit a dead end. Mitigation: monitor the demo as part of the observability stack from Increment 3, and keep a static gif fallback in the README.

The skill's reliability depends on the trigger description matching real user phrasings. A poorly-worded `description:` field can silently kill the user experience. Mitigation: a triggering eval is part of MVP scope and runs in CI from week one.

The audience curve is slower: people have to install Claude Desktop or wire an MCP client to use the engineered version. Mitigation: the web demo carries the casual audience while the repo carries the technical audience.

## Related decisions

- ADR-002 — Model routing (Haiku for vision-based ingredient recognition, Sonnet for recipe generation).
- ADR-TBD — Storage choice (SQLite local file).
- ADR-TBD — Deployment surface (Vercel for the marketing surface).
