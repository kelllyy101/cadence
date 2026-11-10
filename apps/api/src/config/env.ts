import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  MONGO_URL: z.string().startsWith('mongodb'),
});

export type Env = z.infer<typeof envSchema>;

/** Thrown when configuration is invalid. Names the variables, never their values. */
export class EnvError extends Error {
  readonly variables: string[];

  constructor(variables: string[]) {
    super(`Invalid or missing environment variables: ${variables.join(', ')}`);
    this.name = 'EnvError';
    this.variables = variables;
  }
}

/** Validates environment variables at startup. Fails fast on anything missing or malformed. */
export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const variables = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))];
    throw new EnvError(variables);
  }
  return result.data;
}
