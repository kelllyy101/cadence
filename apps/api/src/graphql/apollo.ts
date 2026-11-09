import { ApolloServer } from '@apollo/server';
import type { Logger } from 'pino';
import type { GraphQLContext } from './context';
import { loggingPlugin } from './logging-plugin';
import { resolvers } from './resolvers';
import { loadTypeDefs } from './schema';

export function createApollo(options: {
  production: boolean;
  logger?: Logger;
}): ApolloServer<GraphQLContext> {
  return new ApolloServer<GraphQLContext>({
    typeDefs: loadTypeDefs(),
    resolvers,
    introspection: !options.production,
    // Never send stack traces to clients.
    includeStacktraceInErrorResponses: false,
    plugins: options.logger ? [loggingPlugin(options.logger)] : [],
  });
}
