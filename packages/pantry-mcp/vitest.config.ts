import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globals: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // index.ts is the entry point that calls main() at top level on import.
      // Covered by the manual smoke test, not unit tests — exclude from the
      // gate so it doesn't drag the lines/statements percentages down.
      exclude: ['src/index.ts'],
      reporter: ['text', 'html'],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
  },
});
