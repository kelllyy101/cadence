import { createServer } from 'node:http';
import { z } from 'zod';

// Stub until add-cycle-tracking-and-events: proves the container runs and reports health.
const envResult = z
  .object({ WORKER_HEALTH_PORT: z.coerce.number().int().min(1).max(65535).default(4001) })
  .safeParse(process.env);
if (!envResult.success) {
  process.stderr.write('Invalid or missing environment variables: WORKER_HEALTH_PORT\n');
  process.exit(1);
}
const port = envResult.data.WORKER_HEALTH_PORT;

const server = createServer((req, res) => {
  const ok = req.url === '/health' && req.method === 'GET';
  res.writeHead(ok ? 200 : 404, { 'content-type': 'application/json' });
  res.end(JSON.stringify(ok ? { status: 'ok' } : { error: 'Not found' }));
});

server.listen(port, () => process.stdout.write(`insights-worker stub listening on :${port}\n`));
const shutdown = (): void => {
  server.close(() => process.exit(0));
};
process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
