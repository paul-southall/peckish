import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resolveDbPath } from '../src/paths.js';

describe('resolveDbPath', () => {
  let scratch: string;
  const originalEnv = process.env.PECKISH_DB_PATH;

  beforeEach(async () => {
    scratch = await mkdtemp(join(tmpdir(), 'peckish-paths-'));
  });

  afterEach(async () => {
    await rm(scratch, { recursive: true, force: true });
    if (originalEnv === undefined) {
      delete process.env.PECKISH_DB_PATH;
    } else {
      process.env.PECKISH_DB_PATH = originalEnv;
    }
  });

  it('returns PECKISH_DB_PATH when set, and creates the parent directory', () => {
    const target = join(scratch, 'nested', 'pantry.sqlite');
    process.env.PECKISH_DB_PATH = target;

    const result = resolveDbPath();
    expect(result).toBe(target);
    expect(existsSync(dirname(target))).toBe(true);
  });

  it('falls back to ~/.peckish/pantry.sqlite when env is unset', () => {
    delete process.env.PECKISH_DB_PATH;

    const result = resolveDbPath();
    expect(result).toBe(join(homedir(), '.peckish', 'pantry.sqlite'));
  });

  it('treats an empty PECKISH_DB_PATH as unset', () => {
    process.env.PECKISH_DB_PATH = '';
    const result = resolveDbPath();
    expect(result).toBe(join(homedir(), '.peckish', 'pantry.sqlite'));
  });
});
