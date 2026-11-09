import pino, { type DestinationStream, type Logger } from 'pino';

/**
 * Field names that may hold health, personal or free-text data (ARCHITECTURE § Privacy design).
 * Their values are never logged (privacy rule 5).
 */
export const SENSITIVE_FIELDS = [
  // health-adjacent and special category
  'rpe',
  'energy',
  'notes',
  'distanceM',
  'durationS',
  'weightKg',
  'exercises',
  'sets',
  'reps',
  'periodStartDate',
  'phase',
  'byPhase',
  // personal and free text
  'name',
  'email',
  'prompt',
  // credentials and raw requests
  'password',
  'token',
  'apiKey',
  'authorization',
  'cookie',
  'variables',
  'query',
] as const;

/**
 * Redaction reaches the top level and two levels of nesting only. Deeper values are NOT
 * redacted, so log flat objects of IDs, codes and durations, never whole inputs or documents.
 */
export const REDACT_PATHS = [
  ...SENSITIVE_FIELDS.flatMap((field) => [field, `*.${field}`, `*.*.${field}`]),
  'headers["set-cookie"]',
  '*.headers["set-cookie"]',
];

/** Keeps an error's type and code only; messages and stacks can quote input values. */
function serializeError(err: unknown): { type: string; code?: string } {
  if (!(err instanceof Error)) return { type: 'NonError' };
  const code = (err as { code?: unknown }).code;
  return typeof code === 'string' || typeof code === 'number'
    ? { type: err.name, code: String(code) }
    : { type: err.name };
}

export function createLogger(options: { level: string; destination?: DestinationStream }): Logger {
  return pino(
    {
      level: options.level,
      base: { service: 'api' },
      redact: { paths: REDACT_PATHS, censor: '[redacted]' },
      serializers: { err: serializeError },
    },
    options.destination,
  );
}
