#!/usr/bin/env bash
# scripts/register-mcp.sh
#
# Register pantry-mcp in Claude Desktop's MCP config so it shows up in the
# picker on next launch. Idempotent: re-running updates the path rather than
# duplicating the entry. Pairs with scripts/unregister-mcp.sh.
#
# If ANTHROPIC_API_KEY is set in the current shell or in <repo-root>/.env,
# it gets injected into the MCP entry's `env` block so the spawned MCP
# process can use it for vision calls. Without the key, the server still
# registers and DB-only tools (list/add/remove) work — only
# recognise_ingredients will error out at call time.
#
# Used for the smoke test — see _planning/claude-code-context.md.
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

# Resolve ANTHROPIC_API_KEY: shell env first, then .env file. Empty if neither.
api_key="${ANTHROPIC_API_KEY:-}"
if [[ -z "$api_key" && -f "$REPO_ROOT/.env" ]]; then
  api_key=$(awk -F= '/^ANTHROPIC_API_KEY=/ {sub(/^ANTHROPIC_API_KEY=/, ""); gsub(/^["'\'']|["'\'']$/, ""); print; exit}' "$REPO_ROOT/.env")
fi

# Make sure the config directory exists; initialise an empty config if missing.
mkdir -p "$(dirname "$CONFIG")"
[[ -f "$CONFIG" ]] || echo '{}' > "$CONFIG"

# Snapshot the current config before we touch it so unregister can diff against it.
cp "$CONFIG" "${CONFIG}.peckish-backup"

# Insert or replace the pantry-mcp entry, leaving any other MCP servers alone.
# The env block is conditional on whether we found an API key.
jq --arg name "$ENTRY_NAME" --arg path "$SERVER_PATH" --arg key "$api_key" '
  .mcpServers //= {} |
  .mcpServers[$name] = (
    if $key == "" then
      { "command": "node", "args": [$path] }
    else
      { "command": "node", "args": [$path], "env": { "ANTHROPIC_API_KEY": $key } }
    end
  )
' "$CONFIG" > "${CONFIG}.tmp" && mv "${CONFIG}.tmp" "$CONFIG"

echo "Registered $ENTRY_NAME → $SERVER_PATH"
if [[ -n "$api_key" ]]; then
  echo "ANTHROPIC_API_KEY injected (length: ${#api_key} chars)"
else
  echo "warning: no ANTHROPIC_API_KEY found in shell or $REPO_ROOT/.env"
  echo "         recognise_ingredients will fail until you add it"
  echo "         (re-run this script after setting the key)"
fi
echo "Backup written to ${CONFIG}.peckish-backup"
echo
echo "Restart Claude Desktop to pick up the change."
echo "After the smoke test, run ./scripts/unregister-mcp.sh to clean up."
