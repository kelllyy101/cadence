import { defineConfig } from 'vitest/config';

/** Integration tests: real MongoDB via Testcontainers (see @cadence/testing). */
export default defineConfig({
  test: {
    include: ['src/**/*.int.test.ts'],
    globalSetup: ['@cadence/testing/vitest'],
    // The container starts in globalSetup (Testcontainers' own 120 s startup timeout applies).
    // Hooks only connect; CI runners can still be slow.
    hookTimeout: 30_000,
    testTimeout: 30_000,
  },
});
