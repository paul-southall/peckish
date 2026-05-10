import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { describe, expect, it } from 'vitest';

// This test proves the MCP wiring actually speaks the protocol — not just
// that imports resolve and types are happy. With zero tools registered, the
// server correctly does NOT advertise the tools capability (per spec); the
// empty-tools-list assertion lands when the first tool registers.
describe('mcp server', () => {
  it('completes the initialize handshake and reports its identity', async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    const server = new McpServer({ name: 'pantry-mcp', version: '0.1.0' });
    await server.connect(serverTransport);

    const client = new Client({ name: 'pantry-mcp-test-client', version: '0.0.0' });
    await client.connect(clientTransport);

    try {
      expect(client.getServerVersion()).toEqual({ name: 'pantry-mcp', version: '0.1.0' });
      expect(client.getServerCapabilities()).toBeDefined();
    } finally {
      await client.close();
      await server.close();
    }
  });
});
