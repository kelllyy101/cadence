import type { AddressInfo } from 'node:net';
import { Writable } from 'node:stream';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadEnv } from './config/env';
import { createLogger } from './observability/logger';
import { buildServer } from './server';

let baseUrl = '';
let stop: () => Promise<void> = () => Promise.resolve();
let mongoUp = true;
let logs = '';

beforeAll(async () => {
  const destination = new Writable({
    write(chunk: Buffer, _enc, done) {
      logs += chunk.toString();
      done();
    },
  });
  const built = await buildServer({
    env: loadEnv({ MONGO_URL: 'mongodb://localhost:27017/test' }),
    logger: createLogger({ level: 'info', destination }),
    readinessChecks: {
      mongo: () => (mongoUp ? Promise.resolve() : Promise.reject(new Error('down'))),
    },
  });
  await new Promise<void>((resolve) => built.server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${(built.server.address() as AddressInfo).port}`;
  stop = built.stop;
});

afterAll(() => stop());

const postQuery = (body: unknown) =>
  fetch(`${baseUrl}/graphql`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('HTTP server', () => {
  it('answers a GraphQL POST to /graphql with a request id', async () => {
    const res = await postQuery({ query: '{ hello }' });
    expect(res.status).toBe(200);
    expect(res.headers.get('x-request-id')).toMatch(/^[0-9a-f-]{36}$/);
    expect(await res.json()).toEqual({ data: { hello: 'Hello from the Cadence API' } });
  });

  it('logs the operation name and request id, never the variables', async () => {
    // Given a named operation with variables holding synthetic health data
    await postQuery({
      query: 'query Greeting { hello }',
      operationName: 'Greeting',
      variables: { notes: 'synthetic-secret-note' },
    });

    // Then the log line names the operation but not the variables
    expect(logs).toContain('"operationName":"Greeting"');
    expect(logs).toMatch(/"requestId":"[0-9a-f-]{36}"/);
    expect(logs).not.toContain('synthetic-secret-note');
  });

  it('reports liveness on /health', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('reports ready when MongoDB responds', async () => {
    mongoUp = true;
    const res = await fetch(`${baseUrl}/health/ready`);
    expect(res.status).toBe(200);
  });

  it('returns 503 naming mongo when the database is down', async () => {
    mongoUp = false;
    const res = await fetch(`${baseUrl}/health/ready`);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ status: 'not_ready', failing: ['mongo'] });
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
    expect((await fetch(`${baseUrl}/nope`)).status).toBe(404);
  });
});
