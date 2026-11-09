import { eventSchema, type CadenceEvent } from './envelope';

/** One validation problem. Holds the path and a code only, never the offending value. */
export interface EventIssue {
  path: string;
  code: string;
}

export type ParseEventResult =
  { ok: true; event: CadenceEvent } | { ok: false; error: { issues: EventIssue[] } };

/**
 * Validates an untrusted message (e.g. a decoded Kafka value) against the event catalogue.
 * Never throws. Issues name paths and codes only, so they are safe to log.
 */
export function parseEvent(raw: unknown): ParseEventResult {
  const result = eventSchema.safeParse(raw);
  if (result.success) {
    return { ok: true, event: result.data };
  }
  return {
    ok: false,
    error: {
      issues: result.error.issues.map((issue) => ({
        path: issue.path.map(String).join('.') || '(root)',
        code: issue.code,
      })),
    },
  };
}
