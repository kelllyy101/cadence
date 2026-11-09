import { ApolloServer } from '@apollo/server';
import type { GraphQLContext } from './context';
import { resolvers } from './resolvers';
import { loadTypeDefs } from './schema';

export function createApollo(options: { production: boolean }): ApolloServer<GraphQLContext> {
  return new ApolloServer<GraphQLContext>({
    typeDefs: loadTypeDefs(),
    resolvers,
    introspection: !options.production,
    // Never send stack traces to clients.
    includeStacktraceInErrorResponses: false,
  });
}
