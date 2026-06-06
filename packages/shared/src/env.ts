import { z } from "zod";

export const sharedEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  QUEUE_PREFIX: z.string().min(1).default("signaldock"),
  DEFAULT_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  BACKOFF_DELAY_MS: z.coerce.number().int().positive().default(1000)
});

export type SharedEnv = z.infer<typeof sharedEnvSchema>;
