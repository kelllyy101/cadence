import { randomUUID } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import type { Logger } from 'pino';
import type { Env } from './config/env';
import { createApollo } from './graphql/apollo';
import { handleGraphQL } from './http/graphql-handler';
import { handleLiveness, handleReadiness } from './http/health';
import type { ReadinessCheck } from './observability/readiness';

export interface ServerDeps {
  env: Env;
  logger: Logger;
  readinessChecks: Record<string, ReadinessCheck>;
}

/** Builds the HTTP server: /graphql, /health and /health/ready. */
export async function buildServer(
  deps: ServerDeps,
): Promise<{ server: Server; stop: () => Promise<void> }> {
  const { env, logger, readinessChecks } = deps;
  const apollo = createApollo({ production: env.NODE_ENV === 'production', logger });
  await apollo.start();

  const server = createServer((req, res) => {
    const requestId = randomUUID();
    res.setHeader('x-request-id', requestId);
    const path = new URL(req.url ?? '/', 'http://localhost').pathname;
    const fail = (): void => {
      logger.error({ requestId, path }, 'request failed');
      if (!res.headersSent) res.writeHead(500, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    };

    if (path === '/health' && req.method === 'GET') return handleLiveness(res);
    if (path === '/health/ready' && req.method === 'GET') {
      handleReadiness(res, readinessChecks).catch(fail);
      return;
    }
    if (path === '/graphql') {
      handleGraphQL(apollo, req, res, { requestId }).catch(fail);
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
