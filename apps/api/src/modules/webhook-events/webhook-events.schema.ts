import { WebhookEventStatus } from "@prisma/client";

import { z } from "zod";


const jsonValueSchema: z.ZodTypeAny = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(jsonValueSchema), z.record(jsonValueSchema)])
);

const jsonPayloadSchema: z.ZodTypeAny = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.array(jsonValueSchema), z.record(jsonValueSchema)])
);

export const createWebhookEventSchema = z.object({
  idempotencyKey: z.string().min(1).max(255).optional(),
  targetUrl: z.string().url(),
  payload: jsonPayloadSchema,
  headers: z.record(z.string(), z.string()).optional(),
  maxAttempts: z.number().int().positive().max(25).optional()
});

export const webhookEventIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const webhookEventsListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(WebhookEventStatus).optional()
});

export type CreateWebhookEventBody = z.infer<typeof createWebhookEventSchema>;
