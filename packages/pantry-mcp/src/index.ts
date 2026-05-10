import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { initDb, type Db } from './db.js';
import { log } from './log.js';
import { resolveDbPath } from './paths.js';

const SERVER_NAME = 'pantry-mcp';
const SERVER_VERSION = '0.1.0';

async function main(): Promise<void> {
  const dbPath = resolveDbPath();
  const db = initDb(dbPath);
  log.info('database ready', { path: dbPath });

  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
  // Tools register in subsequent PRs. The empty registry is intentional.

  registerShutdown(db);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  log.info('server connected', { name: SERVER_NAME, version: SERVER_VERSION });
}

function registerShutdown(db: Db): void {
  let closing = false;
  const shutdown = (signal: NodeJS.Signals): void => {
    if (closing) return;
    closing = true;
    log.info('shutdown', { signal });
    try {
      db.close();
    } catch (err) {
      log.error('db.close failed', { error: String(err) });
    }
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('uncaughtException', (err) => {
    log.error('uncaught exception', { error: String(err), stack: err.stack });
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    log.error('unhandled rejection', { reason: String(reason) });
    process.exit(1);
  });
}

await main();
