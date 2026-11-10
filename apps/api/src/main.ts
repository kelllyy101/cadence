import { MongoClient } from 'mongodb';
import { EnvError, loadEnv } from './config/env';
import { createLogger } from './observability/logger';
import { buildServer } from './server';

async function main(): Promise<void> {
  const env = loadEnv();
  const logger = createLogger({ level: env.LOG_LEVEL });
  const mongo = new MongoClient(env.MONGO_URL, { serverSelectionTimeoutMS: 2000 });

  const { server, stop } = await buildServer({
    env,
    logger,
    readinessChecks: {
      mongo: async () => {
        await mongo.db('admin').command({ ping: 1 });
      },
    },
  });
  server.listen(env.API_PORT, () => logger.info({ port: env.API_PORT }, 'api listening'));

  const shutdown = (): void => {
    logger.info('shutting down');
    Promise.all([stop(), mongo.close()])
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

main().catch((error: unknown) => {
  // Startup failures: print the safe message only (EnvError never contains values).
  // Other failures: the error type only, since messages can quote config or input values.
  const message =
    error instanceof EnvError
      ? error.message
      : `API failed to start (${error instanceof Error ? error.name : 'unknown error'})`;
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
