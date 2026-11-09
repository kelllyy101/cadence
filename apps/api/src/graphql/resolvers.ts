import type { Resolvers } from '../generated/resolvers-types';

export const resolvers: Resolvers = {
  Query: {
    hello: () => 'Hello from the Cadence API',
  },
};
