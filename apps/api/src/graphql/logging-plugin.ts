import type { ApolloServerPlugin } from '@apollo/server';
import type { Logger } from 'pino';
import type { GraphQLContext } from './context';

/** Logs operation name, duration and error codes per request. Never variables or results. */
export function loggingPlugin(logger: Logger): ApolloServerPlugin<GraphQLContext> {
  return {
    requestDidStart: () => {
      const started = performance.now();
      return Promise.resolve({
        willSendResponse: ({ request, contextValue, errors }) => {
          logger.info(
            {
              requestId: contextValue.requestId,
              operationName: request.operationName ?? null,
              durationMs: Math.round(performance.now() - started),
              errorCodes: (errors ?? []).map((e) => String(e.extensions['code'] ?? 'UNKNOWN')),
            },
            'graphql request',
          );
          return Promise.resolve();
        },
      });
    },
  };
}
