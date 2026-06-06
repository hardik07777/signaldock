import { sharedEnvSchema } from "@signaldock/shared";
import { z } from "zod";

const apiEnvSchema = sharedEnvSchema.extend({
  PORT: z.coerce.number().int().positive().default(3000),
  API_HOST: z.string().min(1).default("0.0.0.0")
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export function loadApiEnv(): ApiEnv {
  return apiEnvSchema.parse(process.env);
}
