import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('getAnthropic', () => {
  const original = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    // Singleton is module-level state — reset modules so each test imports
    // a fresh instance and the cached client doesn't leak across tests.
    vi.resetModules();
  });

  afterEach(() => {
    if (original === undefined) {
      delete process.env.ANTHROPIC_API_KEY;
    } else {
      process.env.ANTHROPIC_API_KEY = original;
    }
  });

  it('throws when ANTHROPIC_API_KEY is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { getAnthropic } = await import('../src/anthropic.js');
    expect(() => getAnthropic()).toThrow(/ANTHROPIC_API_KEY/);
  });

  it('throws when ANTHROPIC_API_KEY is the empty string', async () => {
    process.env.ANTHROPIC_API_KEY = '';
    const { getAnthropic } = await import('../src/anthropic.js');
    expect(() => getAnthropic()).toThrow(/ANTHROPIC_API_KEY/);
  });

  it('returns a usable Anthropic client when the key is set', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-fake-key';
    const { getAnthropic } = await import('../src/anthropic.js');
    const client = getAnthropic();
    expect(client.messages).toBeDefined();
  });

  it('returns the same instance on repeated calls (singleton)', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-fake-key';
    const { getAnthropic } = await import('../src/anthropic.js');
    const a = getAnthropic();
    const b = getAnthropic();
    expect(a).toBe(b);
  });
});
