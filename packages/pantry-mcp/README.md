# @peckish/pantry-mcp

MCP server that owns persistent pantry state for Peckish. SQLite-backed, stdio
transport, four tools — `list_pantry`, `add_item`, `remove_item`, and
`recognise_ingredients(photo)`.

This package is the engineered core. The skill in [`packages/skill/`](../skill/)
calls it; the eventual landing page in [`packages/web/`](../web/) (Increment 4)
will too.

## Status

**Scaffold only.** Server boots, runs SQLite migrations, exposes zero tools.
Tools land in the next PR.

## Stack

TypeScript on Node 22, the official `@modelcontextprotocol/sdk`, `zod`,
`better-sqlite3`. No web framework — see
[ADR-003](../../docs/adr/0003-mcp-server-stack.md).

## Develop

```bash
pnpm install                            # from repo root
pnpm --filter pantry-mcp dev            # tsx watch on stdio
pnpm --filter pantry-mcp test           # vitest run
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

Restart Claude Desktop. With this scaffold the server appears with zero tools
advertised — that's the intended state until the next PR.

## Database

SQLite single file. Default path is `~/.peckish/pantry.sqlite`, override with
`PECKISH_DB_PATH`. The directory is auto-created on first run.

Schema lives in [`src/db.ts`](src/db.ts). Migrations are idempotent — running
the server twice against the same file does not double-apply.
