import { useQuery } from '@apollo/client/react';
import { graphql } from './generated';

export const HELLO_QUERY = graphql(`
  query Hello {
    hello
  }
`);

export function App() {
  const { data, loading, error } = useQuery(HELLO_QUERY);

  return (
    <main>
      <h1>Cadence</h1>
      <div aria-live="polite">{loading && <p>Connecting to the API…</p>}</div>
      {error && <p role="alert">Couldn't reach the API. Check that it's running.</p>}
      {data && <p>{data.hello}</p>}
    </main>
  );
}
