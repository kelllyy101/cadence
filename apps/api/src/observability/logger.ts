import pino, { type DestinationStream, type Logger } from 'pino';

/**
 * Field names that may hold health, personal or free-text data. Their values are never logged
 * (privacy rule 5). Covers top level and two levels of nesting.
 */
export const SENSITIVE_FIELDS = [
  'rpe',
  'energy',
  'notes',
  'distanceM',
  'durationS',
  'weightKg',
  'exercises',
  'periodStartDate',
  'phase',
  'prompt',
  'email',
  'password',
  'variables',
  'authorization',
  'cookie',
] as const;

export const REDACT_PATHS = SENSITIVE_FIELDS.flatMap((field) => [
  field,
  `*.${field}`,
  `*.*.${field}`,
]);

export function createLogger(options: { level: string; destination?: DestinationStream }): Logger {
  return pino(
    {
      level: options.level,
      base: { service: 'api' },
      redact: { paths: REDACT_PATHS, censor: '[redacted]' },
    },
    options.destination,
  );
}
