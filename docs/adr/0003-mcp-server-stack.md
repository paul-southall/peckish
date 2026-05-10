# ADR-003: MCP server stack — minimal Node + MCP SDK, no framework

**Status:** Accepted
**Date:** 2026-05-09
**Decision-maker:** Paul Southall

## Context

PantryMCP is the MCP server that owns persistent state for Peckish (pantry inventory, dietary profiles, expiry tracking) and exposes four tools to the agent skill: `list_pantry`, `add_item`, `remove_item`, and `recognise_ingredients(photo)`.

Two stack-shaped questions need answers before code lands:

1. **Language.** Node/TypeScript or Python — both have first-party MCP SDKs.
2. **Framework.** Whether to use a web framework (Next.js, NestJS, Fastify, Express) or stay on the bare MCP SDK with focused, individually-justified dependencies.

The decision shapes the project's dependency surface, the install instructions in the README, the size of the audit trail, and the credibility of the engineering signal it sends.

## Decision

**TypeScript on Node 22, with the official MCP SDK and a small set of focused dependencies. No web framework.**

The dependency surface is roughly ten production packages, each with a clear and individually-defensible role. The package will install cleanly, build in seconds, and be readable to anyone who lands on the repo without prior context.

## Options considered

### Language

#### Option L1 — Python with the MCP SDK

*Pros.* Most common language in the broader AI/ML ecosystem; data scientists may find the codebase more approachable.

*Cons.* Less aligned with the broader MCP and tool-publishing ecosystem in 2026 — TypeScript leads on the registry, Python catches up. The eventual Vercel landing surface (Increment 4) is TypeScript-native, so a Python MCP server would split the project across two languages. One language end-to-end is materially simpler.

#### Option L2 — TypeScript on Node 22 *(chosen)*

*Pros.* Single language across MCP server, skill examples, eval suite, and the eventual landing page. Strict-mode types share between MCP server and skill examples via Zod-derived inference. The MCP registry and most published MCP servers in 2026 are TypeScript-first.

*Cons.* The choice is about consistency and ecosystem fit rather than capability — the team-of-one is multilingual already, so portability across languages isn't the real constraint.

### Framework

#### Option F1 — Next.js or similar full-stack framework

*Pros.* Familiar to anyone who's built a web app recently. Vercel-native. Defaults are good for the problems it's designed to solve.

*Cons.* The MCP server isn't a web app. It speaks the MCP protocol over stdio (or a thin streamable HTTP transport that the SDK already handles), with no routing, no middleware, no SSR, no React. Next.js exists to solve problems this server doesn't have. Adopting it would inflate the dependency tree by an order of magnitude, slow builds significantly, and signal *I default to my comfort framework* rather than *I pick tools to match the shape of the problem* — exactly the wrong engineering signal for the project's positioning.

#### Option F2 — Web framework (Express, Fastify, NestJS)

*Pros.* Lighter than Next.js. NestJS in particular brings opinionated structure that some teams find useful.

*Cons.* Same fundamental mismatch as F1, in a smaller package. MCP transport doesn't need request/response abstractions, routing, or middleware. The MCP server's domain is small enough that opinionated structure becomes overhead rather than scaffolding.

#### Option F3 — Bare Node + MCP SDK + focused dependencies *(chosen)*

*Pros.* Each dependency earns its place. The codebase is readable end-to-end. Builds in seconds. Aligned with how the MCP server is conceptually shaped — a small daemon, not an application.

*Cons.* Slightly more boilerplate to wire up shared utilities (logging, error formatting) than a batteries-included framework. Mitigated by writing those utilities once, keeping them small, and documenting them in `/docs/conventions.md` if they grow.

## The chosen dependency set

Each package is justified individually. Anything not on this list waits for a real reason.

| Package | Role |
|---------|------|
| `@modelcontextprotocol/sdk` | Official MCP server implementation. The only dependency that's truly non-negotiable. |
| `zod` | Runtime schema validation on every tool boundary. Types are derived from schemas via `z.infer`, so no drift between runtime and compile-time. |
| `better-sqlite3` | Synchronous SQLite client. No async overhead, single-process correctness. Easier to reason about than `sqlite3` (callback-based) or `kysely`/`prisma` (heavyweight ORMs we don't need at this size). |
| `@anthropic-ai/sdk` | Anthropic API client for the Haiku call inside `recognise_ingredients`. |
| `vitest` | Test runner. ESM-native, fast, plays nicely with TypeScript and Zod. |
| `tsup` | Minimal bundler. The standard choice for MCP server templates; replaces Webpack and the Next.js build pipeline. |
| TypeScript (strict), Prettier, ESLint | Standard dev tooling. |
| *(Increment 3)* `@opentelemetry/sdk-node` | Traces around tool calls. Added when observability work begins — not before. |

Total: roughly ten production dependencies plus standard dev tooling. No transitive bloat.

## Consequences

**Positive.**

The dependency surface is small enough that a senior engineer can audit `package.json` in minutes. *"What's in your dependencies?"* is itself a credibility test most personal projects fail; passing it visibly is exactly the signal this project is positioning toward.

The stack is legible end-to-end. There's no framework convention to learn before the MCP-server code becomes readable.

Type sharing extends across the whole project. The skill examples, the eval suite, and the Vercel landing page (Increment 4) are all TypeScript, which means Zod schemas defined once at the MCP server boundary flow through the rest of the project without being redefined.

The choice is its own piece of launch content. *Why I didn't reach for Next.js for my MCP server* is a defensible post and a rare framing — most of the conversation in 2026 assumes any new project starts with a framework.

**Negative / risks.**

If a future contributor wants to add functionality that genuinely benefits from a framework — say, a web admin UI for the pantry — the framework decision will need to be reopened. Mitigation: when that happens, route the web-app-shaped problem to a web-app-shaped package (`packages/admin/`) rather than retrofitting the MCP server. The MCP server stays focused on its actual job.

The lean dependency choice means more work upfront to set up shared utilities (logging, error formatting, retries) than a framework with batteries-included defaults. Mitigation: write the utilities once, keep them small, document them in `/docs/conventions.md` if and when they grow.

## Related decisions

- ADR-001 — Skill plus MCP server, not a chat wrapper.
- ADR-002 — Model routing (Haiku for vision-based ingredient recognition, Sonnet for recipe generation). *Lands alongside the `recognise_ingredients` work in Phase 2.*
- ADR-TBD — Storage choice (SQLite local file). Implied by this ADR's choice of `better-sqlite3` but worth a dedicated ADR when the schema becomes non-trivial.
- ADR-TBD — Deployment surface for the marketing site (Vercel for Increment 4) — *that* is where Next.js becomes justified, because the problem there has a web-app shape.
