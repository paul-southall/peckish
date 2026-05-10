import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { initDb, type Db } from '../src/db.js';
import { buildServer } from '../src/server.js';

describe('mcp server', () => {
  let db: Db;

  beforeEach(() => {
    db = initDb(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  async function connect(): Promise<{ client: Client; cleanup: () => Promise<void> }> {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = buildServer(db);
    await server.connect(serverTransport);

    const client = new Client({ name: 'pantry-mcp-test-client', version: '0.0.0' });
    await client.connect(clientTransport);

    return {
      client,
      cleanup: async () => {
        await client.close();
        await server.close();
      },
    };
  }

  it('completes the initialize handshake and reports its identity', async () => {
    const { client, cleanup } = await connect();
    try {
      expect(client.getServerVersion()).toEqual({ name: 'pantry-mcp', version: '0.1.0' });
      expect(client.getServerCapabilities()).toBeDefined();
    } finally {
      await cleanup();
    }
  });

  it('advertises the four expected tools via tools/list', async () => {
    const { client, cleanup } = await connect();
    try {
      const { tools } = await client.listTools();
      const names = tools.map((t) => t.name).sort();
      expect(names).toEqual(['add_item', 'list_pantry', 'recognise_ingredients', 'remove_item']);
    } finally {
      await cleanup();
    }
  });

  it('exposes a description and inputSchema on each tool', async () => {
    const { client, cleanup } = await connect();
    try {
      const { tools } = await client.listTools();
      for (const tool of tools) {
        expect(tool.description).toBeTypeOf('string');
        expect(tool.description?.length).toBeGreaterThan(0);
        expect(tool.inputSchema).toBeDefined();
      }
    } finally {
      await cleanup();
    }
  });

  it('returns the empty pantry as structuredContent on list_pantry', async () => {
    const { client, cleanup } = await connect();
    try {
      const result = await client.callTool({ name: 'list_pantry', arguments: {} });
      expect(result.structuredContent).toEqual({ items: [] });
    } finally {
      await cleanup();
    }
  });
});
