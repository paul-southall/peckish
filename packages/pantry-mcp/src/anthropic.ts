import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | undefined;

// Lazy singleton — instantiated on first call so the server can boot
// without the API key (e.g. when only DB-only tools are used in a session).
// Tools that need the client call this; tools that don't, don't.
export function getAnthropic(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey === undefined || apiKey.length === 0) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Add it to .env for local development, ' +
        'or to the Claude Desktop MCP env block for end-to-end use.',
    );
  }
  client = new Anthropic({ apiKey });
  return client;
}
