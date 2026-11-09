import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadEnv } from './config/env';
import { buildServer } from './server';

let baseUrl = '';
let stop: () => Promise<void> = () => Promise.resolve();

beforeAll(async () => {
  const built = await buildServer(loadEnv({ MONGO_URL: 'mongodb://localhost:27017/test' }));
  await new Promise<void>((resolve) => built.server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${(built.server.address() as AddressInfo).port}`;
  stop = built.stop;
});

afterAll(() => stop());

describe('HTTP server', () => {
  it('answers a GraphQL POST to /graphql', async () => {
    // Given the running server
    // When a client posts the hello query
    const res = await fetch(`${baseUrl}/graphql`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ hello }' }),
    });

    // Then it gets the greeting and a request id header
    expect(res.status).toBe(200);
    expect(res.headers.get('x-request-id')).toMatch(/^[0-9a-f-]{36}$/);
    expect(await res.json()).toEqual({ data: { hello: 'Hello from the Cadence API' } });
  });

  it('rejects a malformed JSON body with 400', async () => {
    const res = await fetch(`${baseUrl}/graphql`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{not json',
    });
    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown paths', async () => {
    const res = await fetch(`${baseUrl}/nope`);
    expect(res.status).toBe(404);
  });
});
