import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

export function createApolloClient(uri = '/graphql'): ApolloClient {
  return new ApolloClient({
    link: new HttpLink({ uri, credentials: 'same-origin' }),
    // In-memory only: health data is never persisted to browser storage.
    cache: new InMemoryCache(),
  });
}
