import { sharedEnvSchema } from "@signaldock/shared";
import { z } from "zod";

const workerEnvSchema = sharedEnvSchema.extend({
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(10),
  DELIVERY_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  WEBHOOK_SIGNING_SECRET: z.string().min(1)
});

export type WorkerEnv = z.infer<typeof workerEnvSchema>;

export function loadWorkerEnv(): WorkerEnv {
  return workerEnvSchema.parse(process.env);
}
