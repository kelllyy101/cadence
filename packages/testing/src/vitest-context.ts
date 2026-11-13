/**
 * Types for values the harness hands to tests via Vitest's `provide`/`inject`.
 * Consumers add `import '@cadence/testing/vitest-context';` in a `.d.ts` so `inject('mongoUrl')`
 * typechecks without importing Testcontainers into test workers.
 */
declare module 'vitest' {
  export interface ProvidedContext {
    /** Connection string of the MongoDB replica set started for this test run. */
    mongoUrl: string;
  }
}

export {};
