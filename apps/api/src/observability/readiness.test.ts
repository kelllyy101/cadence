import { describe, expect, it } from 'vitest';
import { checkReadiness } from './readiness';

describe('checkReadiness', () => {
  it('is ready when every dependency responds', async () => {
    const report = await checkReadiness({ mongo: () => Promise.resolve() });
    expect(report).toEqual({ ready: true, failing: [] });
  });

  it('names the failing dependency without its error details', async () => {
    // Given a database check that fails with a connection string in the error
    const report = await checkReadiness({
      mongo: () => Promise.reject(new Error('connect ECONNREFUSED mongodb://user:pw@host')),
    });

    // Then only the dependency name is reported
    expect(report).toEqual({ ready: false, failing: ['mongo'] });
    expect(JSON.stringify(report)).not.toContain('mongodb://');
  });

  it('treats a hanging dependency as not ready', async () => {
    const report = await checkReadiness({ mongo: () => new Promise(() => undefined) }, 20);
    expect(report.failing).toEqual(['mongo']);
  });
});
