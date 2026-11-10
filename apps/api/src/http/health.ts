import type { ServerResponse } from 'node:http';
import { checkReadiness, type ReadinessCheck } from '../observability/readiness';

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

/** GET /health: the process is alive. Never checks dependencies. */
export function handleLiveness(res: ServerResponse): void {
  json(res, 200, { status: 'ok' });
}

/** GET /health/ready: 200 when every dependency responds, 503 naming the ones that don't. */
export async function handleReadiness(
  res: ServerResponse,
  checks: Record<string, ReadinessCheck>,
): Promise<void> {
  const report = await checkReadiness(checks);
  json(
    res,
    report.ready ? 200 : 503,
    report.ready ? { status: 'ready' } : { status: 'not_ready', failing: report.failing },
  );
}
