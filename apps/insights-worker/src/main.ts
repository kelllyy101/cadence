import { createServer } from 'node:http';

// Stub until add-cycle-tracking-and-events: proves the container runs and reports health.
const port = Number(process.env['WORKER_HEALTH_PORT'] ?? 4001);

const server = createServer((req, res) => {
  const ok = req.url === '/health' && req.method === 'GET';
  res.writeHead(ok ? 200 : 404, { 'content-type': 'application/json' });
  res.end(JSON.stringify(ok ? { status: 'ok' } : { error: 'Not found' }));
});

server.listen(port, () => process.stdout.write(`insights-worker stub listening on :${port}\n`));
process.once('SIGTERM', () => server.close(() => process.exit(0)));
