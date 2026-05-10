# @peckish/pantry-mcp

MCP server that owns persistent pantry state for Peckish. SQLite-backed, stdio
transport, four tools — `list_pantry`, `add_item`, `remove_item`, and
`recognise_ingredients(photo)`.

This package is the engineered core. The skill in [`packages/skill/`](../skill/)
calls it; the eventual landing page in [`packages/web/`](../web/) (Increment 4)
will too.

## Tools

| Tool | What it does |
|---|---|
| `list_pantry` | Returns every pantry row, sorted alphabetically by name. |
| `add_item` | Inserts a row. Two adds of the same name produce two rows; consolidation is intentional for v1. |
| `remove_item` | Removes some or all of an ingredient. Multiple matching rows are decremented oldest-first (FIFO). |
| `recognise_ingredients` | Wraps a Haiku vision call ([ADR-002](../../docs/adr/0002-model-routing.md)). Takes a base64 photo, returns raw recognition results with per-item confidence. No filtering at this boundary — the skill decides how to present uncertainty. |

## Stack

TypeScript on Node 22, the official `@modelcontextprotocol/sdk`, `zod`,
`better-sqlite3`. No web framework — see
[ADR-003](../../docs/adr/0003-mcp-server-stack.md).

## Develop

```bash
pnpm install                            # from repo root
pnpm --filter pantry-mcp dev            # tsx watch on stdio
pnpm --filter pantry-mcp test           # vitest run
pnpm --filter pantry-mcp test:coverage  # vitest run + 60% threshold gate
pnpm --filter pantry-mcp typecheck      # tsc --noEmit
pnpm --filter pantry-mcp lint           # eslint
pnpm --filter pantry-mcp build          # tsup → dist/index.js
```

## Run as an MCP server in Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pantry-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/peckish/packages/pantry-mcp/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop. The server appears with four tools advertised. The
recognise-ingredients tool needs `ANTHROPIC_API_KEY` in the spawned MCP
process's environment — easiest path is the bundled
[`scripts/register-mcp.sh`](../../scripts/register-mcp.sh), which reads
the key from your local `.env` and injects it into the MCP entry's `env`
block.

## Database

SQLite single file. Default path is `~/.peckish/pantry.sqlite`, override with
`PECKISH_DB_PATH`. The directory is auto-created on first run.

Schema lives in [`src/db.ts`](src/db.ts). Migrations are idempotent — running
the server twice against the same file does not double-apply.
