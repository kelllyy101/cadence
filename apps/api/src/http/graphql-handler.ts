import { HeaderMap, type ApolloServer } from '@apollo/server';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { GraphQLContext } from '../graphql/context';

const MAX_BODY_BYTES = 1_000_000;

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = chunk as Buffer;
    size += buffer.length;
    if (size > MAX_BODY_BYTES) throw new Error('Request body too large');
    chunks.push(buffer);
  }
  if (chunks.length === 0) return undefined;
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

/** Bridges Node's http request/response to Apollo Server, with no framework dependency. */
export async function handleGraphQL(
  apollo: ApolloServer<GraphQLContext>,
  req: IncomingMessage,
  res: ServerResponse,
  context: GraphQLContext,
): Promise<void> {
  const headers = new HeaderMap();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }

  let body: unknown;
  try {
    body = req.method === 'POST' ? await readJsonBody(req) : undefined;
  } catch {
    res.writeHead(400, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ errors: [{ message: 'Invalid request body' }] }));
    return;
  }

  const url = new URL(req.url ?? '/', 'http://localhost');
  const result = await apollo.executeHTTPGraphQLRequest({
    httpGraphQLRequest: {
      method: req.method ?? 'GET',
      headers,
      search: url.search,
      body,
    },
    context: () => Promise.resolve(context),
  });

  for (const [key, value] of result.headers) res.setHeader(key, value);
  res.statusCode = result.status ?? 200;

  if (result.body.kind === 'complete') {
    res.end(result.body.string);
    return;
  }
  for await (const chunk of result.body.asyncIterator) res.write(chunk);
  res.end();
}
