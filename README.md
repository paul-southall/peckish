# Peckish

*Stop staring at the fridge.*

A small kitchen helper. You take a photo of your fridge; Peckish suggests three dinners you can actually make tonight, with the time each will take and what's missing if anything.

> **In development.** Peckish is being built in public over five to six weekends. This README fills in as the project does — see the [build journal](./docs/journal.md) for week-by-week progress.

## What it is

Two parts, working together.

**Peckish** is a Claude skill that runs inside Claude Desktop, Claude Code, or any client that speaks the [Model Context Protocol](https://modelcontextprotocol.io). You ask Claude what's for dinner; Peckish takes it from there.

**PantryMCP** is the small server behind it. It owns persistent state — what's in the fridge, dietary profiles, what's about to go off — and the skill calls into it through MCP's tool protocol.

A small web demo will wrap the same backend for visitors who don't run an MCP client. *(Coming Increment 4.)*

## How to use it

*Install instructions land at end of session 2.* For now, see the [build plan](./_planning/pantry-to-dinner-build-plan.md) for the project's intended shape and the [build journal](./docs/journal.md) for what's actually shipped so far.

## Why it's built this way

Three architectural decisions worth flagging upfront. Each is documented as an Architecture Decision Record.

- [**ADR-001 — Skill plus MCP server, not a chat wrapper.**](./docs/adr/0001-mcp-skill-not-chat-wrapper.md) Reusable across every Claude surface, and legible to anyone reviewing the code.
- **ADR-002 — Model routing.** Haiku for vision-based ingredient recognition, Sonnet for recipe generation. Cost numbers reported. *(Lands session 1.)*
- **ADR-003 — Storage choice.** SQLite over a hosted database for v1. Local-first by default. *(Lands session 2.)*

## Project structure

```
peckish/
├── docs/
│   ├── adr/                  Architecture Decision Records
│   ├── ai-pm-workflow.md     How this project is project-managed
│   ├── dod.md                Definition of Done for every PR
│   ├── failures.md           Things that didn't work, and why
│   ├── journal.md            Weekly build journal
│   ├── prompt-history.md     Changes to skill description and other prompts
│   └── risks.md              Active risk register
├── packages/
│   ├── pantry-mcp/           The MCP server (state)
│   └── skill/                The Peckish skill (intent)
└── evals/
    ├── triggering.test.ts    Does Claude reach for the skill?
    ├── quality.test.ts       Are the recipes good?
    └── fixtures/             Test inventories and fridge photos
```

## Engineering practices

A personal project, shipped with the engineering discipline of a commercial product. The artefacts that make that real:

- [**Architecture Decision Records**](./docs/adr/) for every meaningful choice
- [**Definition of Done**](./docs/dod.md) — every PR clears the same bar
- **Triggering and quality evals** running in CI, results published here once stable
- **Observability** organised against the Four Golden Signals adapted for AI workloads *(Increment 3)*
- [**AI-native project management**](./docs/ai-pm-workflow.md) — Claude plus the GitHub MCP run the workflow end-to-end
- [**Public risk register**](./docs/risks.md), updated weekly

## Roadmap

The project ships in increments. Each is independently shippable and produces its own piece of writing.

| Increment              | Scope                                                    | Status      |
| ---------------------- | -------------------------------------------------------- | ----------- |
| MVP                    | Composed skill + MCP, photo or text input, evals, GitHub-MCP-driven PM | in progress |
| 1                      | Programmatic allergen safety verifier                    |             |
| 2                      | Memory and feedback                                      |             |
| 3                      | Observability — Four Golden Signals for AI               |             |
| 4                      | Brand and Vercel landing page                            |             |
| 5                      | Grafana MCP for natural-language ops                     |             |
| 6                      | RAG over a personal cookbook corpus                      |             |
| 7 *(v2)*               | Auth and multi-user                                      |             |

Full plan in [`_planning/pantry-to-dinner-build-plan.md`](./_planning/pantry-to-dinner-build-plan.md) (local only).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Every PR follows the [project-management workflow](./docs/ai-pm-workflow.md) and clears the [Definition of Done](./docs/dod.md).

## License

[MIT](./LICENSE).
