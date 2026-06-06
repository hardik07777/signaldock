import { Prisma, WebhookEventStatus } from "@prisma/client";
import type { Queue } from "bullmq";
import type { FastifyBaseLogger } from "fastify";

import type { DeliveryJobData } from "@signaldock/shared";
import type { PrismaClient } from "@prisma/client";

import type { CreateWebhookEventBody } from "./webhook-events.schema";
import { eventsTotal } from "../../metrics/registry";

interface WebhookEventServiceDeps {
  prisma: PrismaClient;
  deliveryQueue: Queue<DeliveryJobData>;
  logger: FastifyBaseLogger;
  defaultMaxAttempts: number;
  backoffDelayMs: number;
  jobName: string;
}

export class WebhookEventService {
  constructor(private readonly deps: WebhookEventServiceDeps) {}

  async createEvent(input: CreateWebhookEventBody) {
    const maxAttempts = input.maxAttempts ?? this.deps.defaultMaxAttempts;

    if (input.idempotencyKey) {
      const existing = await this.deps.prisma.webhookEvent.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: { attempts: true, deadLetterEntry: true }
      });

      if (existing) {
        return { event: existing, duplicated: true };
      }
    }

    try {
      const event = await this.deps.prisma.$transaction(async (tx) => {
        const createdEvent = await tx.webhookEvent.create({
          data: {
            targetUrl: input.targetUrl,
            payload: input.payload as Prisma.InputJsonValue,
            maxAttempts,
            ...(input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : {}),
            ...(input.headers ? { headers: input.headers as Prisma.InputJsonValue } : {})
          }
        });

        await this.deps.deliveryQueue.add(
          this.deps.jobName,
          { eventId: createdEvent.id },
          {
            attempts: maxAttempts,
            jobId: createdEvent.id,
            backoff: {
              type: "exponential",
              delay: this.deps.backoffDelayMs
            }
          }
        );
        eventsTotal.inc();

        return createdEvent;
      });

      this.deps.logger.info({ eventId: event.id }, "Webhook event accepted");

      return { event, duplicated: false };
    } catch (error) {
      this.deps.logger.error({ err: error }, "Failed to create webhook event");
      throw error;
    }
  }

  async getEventById(id: string) {
    return this.deps.prisma.webhookEvent.findUnique({
      where: { id },
      include: {
        attempts: {
          orderBy: { attemptNumber: "asc" }
        },
        deadLetterEntry: true
      }
    });
  }

  async replayEvent(id: string) {
    const event = await this.deps.prisma.webhookEvent.findUnique({
      where: { id }
    });

    if (!event) {
      return null;
    }

    await this.deps.prisma.webhookEvent.update({
      where: { id },
      data: {
        status: WebhookEventStatus.PENDING,
        deliveredAt: null,
        deadLetteredAt: null,
        lastError: null
      }
    });

    await this.deps.deliveryQueue.add(
      this.deps.jobName,
      { eventId: id },
      {
        attempts: event.maxAttempts,
        jobId: `${id}-replay-${Date.now()}`,
        backoff: {
          type: "exponential",
          delay: this.deps.backoffDelayMs
        }
      }
    );

    this.deps.logger.info(
      { eventId: id },
      "Webhook replay queued"
    );


    return { success: true };
  }
  async listEvents(
  page: number,
  limit: number,
  status?: WebhookEventStatus
) {
  const where = status
    ? { status }
    : {};

  const [items, total] = await Promise.all([
    this.deps.prisma.webhookEvent.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc"
      }
    }),
    this.deps.prisma.webhookEvent.count({
      where
    })
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total
    }
  };
}
}