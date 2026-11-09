import { describe, expect, it } from 'vitest';
import { createApollo } from './apollo';

describe('GraphQL hello', () => {
  it('returns the greeting from the hello query', async () => {
    // Given a started Apollo server
    const apollo = createApollo({ production: false });
    await apollo.start();

    // When the hello query runs
    const response = await apollo.executeOperation(
      { query: '{ hello }' },
      { contextValue: { requestId: 'req_test' } },
    );

    // Then it returns the greeting with no errors
    expect(response.body.kind).toBe('single');
    if (response.body.kind === 'single') {
      expect(response.body.singleResult.errors).toBeUndefined();
      expect(response.body.singleResult.data).toEqual({ hello: 'Hello from the Cadence API' });
    }
    await apollo.stop();
  });
});
