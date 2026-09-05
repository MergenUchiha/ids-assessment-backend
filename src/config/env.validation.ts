import { z } from 'zod';

/**
 * Every environment variable the application reads.
 *
 * `JWT_SECRET` has no fallback and no `!`: it used to be read as
 * `process.env.JWT_SECRET!` at module-import time, before `ConfigModule`
 * had loaded `.env`, so the non-null assertion was hiding a value that was
 * usually undefined.
 */
const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_SECRET: z
    .string()
    .min(
      32,
      'JWT_SECRET must be at least 32 characters. Generate one with: openssl rand -base64 48',
    ),
  JWT_EXPIRES_IN: z.string().min(1).default('12h'),

  REDIS_HOST: z.string().min(1).default('localhost'),
  REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),

  CORS_ORIGINS: z
    .string()
    .default(
      'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173',
    ),

  SWAGGER_ENABLED: z.enum(['true', 'false']).optional(),

  /**
   * The runner drives these containers. Names are matched against the same
   * pattern Docker accepts, so a value from the environment cannot smuggle an
   * extra argument into `docker exec`.
   */
  LAB_ATTACKER_CONTAINER: z
    .string()
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/, 'Not a valid container name')
    .default('ids_attacker'),
  LAB_VICTIM_HOST: z
    .string()
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/, 'Not a valid host name')
    .default('victim'),

  EVE_JSON_PATH: z.string().min(1).default('./artifacts/suricata/eve.json'),
});

export type Env = Omit<z.infer<typeof EnvSchema>, 'SWAGGER_ENABLED'> & {
  SWAGGER_ENABLED: boolean;
};

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = EnvSchema.safeParse(config);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Invalid environment configuration:\n${details}\n\nSee .env.example for the full list.`,
    );
  }

  const env = parsed.data;

  return {
    ...env,
    SWAGGER_ENABLED:
      env.SWAGGER_ENABLED === undefined
        ? env.NODE_ENV !== 'production'
        : env.SWAGGER_ENABLED === 'true',
  };
}
