import { describe, expect, it } from 'vitest';
import { createApollo } from './apollo';
import { formatError } from './format-error';

async function run(query: string, variables?: Record<string, unknown>) {
  const apollo = createApollo({ production: true });
  await apollo.start();
  const response = await apollo.executeOperation(
    { query, ...(variables ? { variables } : {}) },
    { contextValue: { requestId: 'req_test' } },
  );
  await apollo.stop();
  return JSON.stringify(response.body);
}

describe('formatError', () => {
  it('never echoes an invalid variable value', async () => {
    // Given a request whose variable can't be coerced (synthetic value)
    // When it runs
    const body = await run('query ($x: Boolean!) { hello @include(if: $x) }', {
      x: 'synthetic-secret-42',
    });

    // Then the response has a code but not the value
    expect(body).toContain('BAD_USER_INPUT');
    expect(body).not.toContain('synthetic-secret-42');
  });

  it('keeps messages of typed errors we raised for a field', () => {
    const out = formatError({
      message: 'RPE must be between 1 and 10',
      extensions: { code: 'BAD_USER_INPUT', field: 'rpe' },
    });
    expect(out).toEqual({
      message: 'RPE must be between 1 and 10',
      extensions: { code: 'BAD_USER_INPUT', field: 'rpe' },
    });
  });

  it('masks unexpected errors as internal', () => {
    const out = formatError({ message: 'E11000 dup key: { email: "a@example.test" }' });
    expect(out).toEqual({
      message: 'Internal server error',
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  });

  it('gives request errors a generic message', () => {
    const out = formatError({
      message: 'Variable "$input" got invalid value 11 at "input.rpe"',
      extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
    });
    expect(out.message).toBe('Invalid request');
  });
});
