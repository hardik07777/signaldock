import type { FastifyInstance } from "fastify";

import {
  createWebhookEventSchema,
  webhookEventIdParamsSchema,
  webhookEventsListQuerySchema
} from "./webhook-events.schema";

import { WebhookEventService } from "./webhook-events.service";

interface RegisterWebhookEventRoutesOptions {
  service: WebhookEventService;
}

export async function registerWebhookEventRoutes(
  app: FastifyInstance,
  options: RegisterWebhookEventRoutesOptions
) {
  app.post("/v1/webhook-events", async (request, reply) => {
   

    const body = createWebhookEventSchema.parse(request.body);
    const result = await options.service.createEvent(body);

    return reply.code(result.duplicated ? 200 : 202).send({
      id: result.event.id,
      status: result.event.status,
      duplicated: result.duplicated
    });
  });

  app.get("/v1/webhook-events", async (request) => {
  const query = webhookEventsListQuerySchema.parse(
    request.query
  );

  return options.service.listEvents(
    query.page,
    query.limit,
    query.status
  );
});

  app.get("/v1/webhook-events/:id", async (request, reply) => {
    const params = webhookEventIdParamsSchema.parse(request.params);
    const event = await options.service.getEventById(params.id);

    if (!event) {
      return reply.code(404).send({
        message: "Webhook event not found"
      });
    }

    return reply.send(event);
  });
   app.post("/v1/webhook-events/:id/replay", async (request, reply) => {
  const params = webhookEventIdParamsSchema.parse(request.params);

  const result = await options.service.replayEvent(params.id);

  if (!result) {
    return reply.code(404).send({
      message: "Webhook event not found"
    });
  }

  return reply.code(202).send({
    message: "Webhook replay queued"
  });
});
}
