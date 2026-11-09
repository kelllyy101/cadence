import { EnvError, loadEnv } from './config/env';
import { buildServer } from './server';

async function main(): Promise<void> {
  const env = loadEnv();
  const { server, stop } = await buildServer(env);
  server.listen(env.API_PORT, () => {
    process.stdout.write(`api listening on :${env.API_PORT}\n`);
  });

  const shutdown = (): void => {
    stop()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

main().catch((error: unknown) => {
  // Startup failures: print the safe message only (EnvError never contains values).
  const message = error instanceof EnvError ? error.message : 'API failed to start';
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
