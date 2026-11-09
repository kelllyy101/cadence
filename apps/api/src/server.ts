import { randomUUID } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import type { Env } from './config/env';
import { createApollo } from './graphql/apollo';
import { handleGraphQL } from './http/graphql-handler';

/** Builds the HTTP server: /graphql today; health, export and metrics routes join later. */
export async function buildServer(
  env: Env,
): Promise<{ server: Server; stop: () => Promise<void> }> {
  const apollo = createApollo({ production: env.NODE_ENV === 'production' });
  await apollo.start();

  const server = createServer((req, res) => {
    const requestId = randomUUID();
    res.setHeader('x-request-id', requestId);
    const path = new URL(req.url ?? '/', 'http://localhost').pathname;

    if (path === '/graphql') {
      handleGraphQL(apollo, req, res, { requestId }).catch(() => {
        if (!res.headersSent) res.writeHead(500, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ errors: [{ message: 'Internal server error' }] }));
      });
      return;
    }

    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  return {
    server,
    stop: async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await apollo.stop();
    },
  };
}
