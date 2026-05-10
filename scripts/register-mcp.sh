#!/usr/bin/env bash
# scripts/register-mcp.sh
#
# Register pantry-mcp in Claude Desktop's MCP config so it shows up in the
# picker on next launch. Idempotent: re-running updates the path rather than
# duplicating the entry. Pairs with scripts/unregister-mcp.sh.
#
# Used for the foundation smoke test — see _planning/claude-code-context.md
# for the full procedure.
#
# Usage:
#   ./scripts/register-mcp.sh
#
# Requires:
#   - jq (install via `brew install jq` if missing)
#   - The pantry-mcp package built at packages/pantry-mcp/dist/index.js

set -euo pipefail

CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
ENTRY_NAME="pantry-mcp"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVER_PATH="$REPO_ROOT/packages/pantry-mcp/dist/index.js"

command -v jq >/dev/null || {
  echo "error: jq is required — install via 'brew install jq'"
  exit 1
}

# Make sure the config directory exists; initialise an empty config if missing.
mkdir -p "$(dirname "$CONFIG")"
[[ -f "$CONFIG" ]] || echo '{}' > "$CONFIG"

# Snapshot the current config before we touch it so unregister can diff against it.
cp "$CONFIG" "${CONFIG}.peckish-backup"

# Insert or replace the pantry-mcp entry, leaving any other MCP servers alone.
jq --arg name "$ENTRY_NAME" --arg path "$SERVER_PATH" '
  .mcpServers //= {} |
  .mcpServers[$name] = {
    "command": "node",
    "args": [$path]
  }
' "$CONFIG" > "${CONFIG}.tmp" && mv "${CONFIG}.tmp" "$CONFIG"

echo "Registered $ENTRY_NAME → $SERVER_PATH"
echo "Backup written to ${CONFIG}.peckish-backup"
echo
echo "Restart Claude Desktop to pick up the change."
echo "After the smoke test, run ./scripts/unregister-mcp.sh to clean up."
