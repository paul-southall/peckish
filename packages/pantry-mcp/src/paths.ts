import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

// MCP servers are launched by clients (Claude Desktop, etc.) with an
// unpredictable cwd. A cwd-relative DB path scatters files across the
// filesystem in confusing places, so we resolve to a stable home-dir path
// by default and let PECKISH_DB_PATH override.
export function resolveDbPath(): string {
  const fromEnv = process.env.PECKISH_DB_PATH;
  const path =
    fromEnv && fromEnv.length > 0 ? fromEnv : join(homedir(), '.peckish', 'pantry.sqlite');
  mkdirSync(dirname(path), { recursive: true });
  return path;
}
