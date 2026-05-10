#!/usr/bin/env bash
# scripts/unregister-mcp.sh
#
# Remove the pantry-mcp entry from Claude Desktop's MCP config. Surgical —
# leaves any other MCP servers you have configured untouched. Pairs with
# scripts/register-mcp.sh.
#
# Used for the foundation smoke test — see _planning/claude-code-context.md
# for the full procedure.
#
# Usage:
#   ./scripts/unregister-mcp.sh
#
# Requires:
#   - jq (install via `brew install jq` if missing)

set -euo pipefail

CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
ENTRY_NAME="pantry-mcp"

command -v jq >/dev/null || {
  echo "error: jq is required — install via 'brew install jq'"
  exit 1
}

if [[ ! -f "$CONFIG" ]]; then
  echo "Config not found at $CONFIG — nothing to do."
  exit 0
fi

# Surgically remove only the pantry-mcp entry; leave the rest of the config alone.
jq --arg name "$ENTRY_NAME" '
  if .mcpServers and (.mcpServers | has($name)) then
    .mcpServers |= del(.[$name])
  else
    .
  end
' "$CONFIG" > "${CONFIG}.tmp" && mv "${CONFIG}.tmp" "$CONFIG"

echo "Removed $ENTRY_NAME from $CONFIG"
echo
echo "Restart Claude Desktop to pick up the change."
if [[ -f "${CONFIG}.peckish-backup" ]]; then
  echo "Backup from last register is still at ${CONFIG}.peckish-backup if you want to diff."
fi
