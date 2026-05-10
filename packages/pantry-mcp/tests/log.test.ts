import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { log } from '../src/log.js';

describe('log', () => {
  let stderrSpy: MockInstance;
  const originalLevel = process.env.PECKISH_LOG_LEVEL;

  beforeEach(() => {
    stderrSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    stderrSpy.mockRestore();
    if (originalLevel === undefined) {
      delete process.env.PECKISH_LOG_LEVEL;
    } else {
      process.env.PECKISH_LOG_LEVEL = originalLevel;
    }
  });

  function lastLine(): Record<string, unknown> {
    const callArg = stderrSpy.mock.calls.at(-1)?.[0] as string | undefined;
    if (callArg === undefined) throw new Error('expected at least one log line');
    return JSON.parse(callArg) as Record<string, unknown>;
  }

  it('writes structured JSON to stderr at info level', () => {
    log.info('hello', { db: 'ready' });
    expect(stderrSpy).toHaveBeenCalledOnce();
    expect(lastLine()).toMatchObject({ level: 'info', msg: 'hello', db: 'ready' });
  });

  it('warn and error also emit', () => {
    log.warn('warning');
    log.error('failure', { code: 1 });
    expect(stderrSpy).toHaveBeenCalledTimes(2);
  });

  it('suppresses debug at the default info level', () => {
    delete process.env.PECKISH_LOG_LEVEL;
    log.debug('quiet');
    expect(stderrSpy).not.toHaveBeenCalled();
  });

  it('emits debug when PECKISH_LOG_LEVEL=debug', () => {
    process.env.PECKISH_LOG_LEVEL = 'debug';
    log.debug('verbose');
    expect(stderrSpy).toHaveBeenCalledOnce();
    expect(lastLine()).toMatchObject({ level: 'debug', msg: 'verbose' });
  });

  it('attaches a timestamp', () => {
    log.info('time check');
    const ts = lastLine().ts;
    expect(typeof ts).toBe('string');
    expect(ts as string).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
