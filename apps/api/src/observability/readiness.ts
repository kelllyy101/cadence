/** A dependency check that resolves when healthy and rejects otherwise. */
export type ReadinessCheck = () => Promise<void>;

export interface ReadinessReport {
  ready: boolean;
  failing: string[];
}

function withTimeout(check: ReadinessCheck, ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    check().then(
      () => {
        clearTimeout(timer);
        resolve();
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error('check failed'));
      },
    );
  });
}

/** Runs every check in parallel. Reports only dependency names, never connection details. */
export async function checkReadiness(
  checks: Record<string, ReadinessCheck>,
  timeoutMs = 2000,
): Promise<ReadinessReport> {
  const entries = Object.entries(checks);
  const names = entries.map(([name]) => name);
  const results = await Promise.allSettled(
    entries.map(([, check]) => withTimeout(check, timeoutMs)),
  );
  const failing = names.filter((_, i) => results[i]?.status === 'rejected');
  return { ready: failing.length === 0, failing };
}
