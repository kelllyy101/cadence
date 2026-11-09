import type { GraphQLFormattedError } from 'graphql';

/** Error codes our resolvers raise on purpose, with messages we wrote (never user values). */
const TYPED_CODES = new Set([
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'BAD_USER_INPUT',
  'NOT_FOUND',
  'CONSENT_REQUIRED',
]);

/** Codes graphql-js and Apollo raise for malformed requests; their messages can quote input. */
const REQUEST_ERROR_CODES = new Set([
  'GRAPHQL_PARSE_FAILED',
  'GRAPHQL_VALIDATION_FAILED',
  'BAD_REQUEST',
]);

/**
 * Shapes every error sent to clients. Errors never echo submitted values (privacy rule 5):
 * - our typed errors keep their message only if they set `extensions.field` (written by us);
 * - request and coercion errors get a generic message;
 * - anything else becomes INTERNAL_SERVER_ERROR.
 */
export function formatError(formatted: GraphQLFormattedError): GraphQLFormattedError {
  const code = String(formatted.extensions?.['code'] ?? 'INTERNAL_SERVER_ERROR');
  const path = formatted.path ? { path: formatted.path } : {};

  if (TYPED_CODES.has(code)) {
    const field = formatted.extensions?.['field'];
    const ours = code !== 'BAD_USER_INPUT' || typeof field === 'string';
    return {
      message: ours ? formatted.message : 'Invalid input',
      ...path,
      extensions: typeof field === 'string' ? { code, field } : { code },
    };
  }
  if (REQUEST_ERROR_CODES.has(code)) {
    return { message: 'Invalid request', extensions: { code } };
  }
  return {
    message: 'Internal server error',
    ...path,
    extensions: { code: 'INTERNAL_SERVER_ERROR' },
  };
}
