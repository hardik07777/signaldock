import {
  DeliveryAttemptStatus,
  Prisma,
  WebhookEventStatus,
  type PrismaClient
} from "@prisma/client";
import type { Job } from "bullmq";
import type { Queue } from "bullmq";

import type { DeliveryJobData } from "@signaldock/shared";
import type { Logger } from "pino";

import type { WorkerEnv } from "../config/env";
import crypto from "node:crypto";


class HttpDeliveryError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
    readonly responseBody?: string
  ) {
    super(message);
    this.name = "HttpDeliveryError";
  }
}

interface DeliveryServiceDeps {
  prisma: PrismaClient;
  deadLetterQueue: Queue<DeliveryJobData>;
  env: WorkerEnv;
  logger: Logger;
}

function toHeaderRecord(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  return Object.entries(input).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === "string") {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function truncate(value: string | undefined, maxLength = 2000) {
  if (!value) {
    return undefined;
  }

  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function toPrismaJsonValue(value: Prisma.JsonValue) {
  return value === null ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
}

export class DeliveryService {
  constructor(private readonly deps: DeliveryServiceDeps) {}

  async process(job: Job<DeliveryJobData>) {
    const event = await this.deps.prisma.webhookEvent.findUnique({
      where: { id: job.data.eventId }
    });

    if (!event) {
      throw new Error(`Webhook event ${job.data.eventId} does not exist`);
    }

    const lastAttempt = await this.deps.prisma.deliveryAttempt.findFirst({
       where: {
         eventId: event.id
       },
       orderBy: {
         attemptNumber: "desc"
       },
       select: {
         attemptNumber: true
       }
     });
     
     const attemptNumber = (lastAttempt?.attemptNumber ?? 0) + 1;
         const totalAttempts = job.opts.attempts ?? event.maxAttempts;
         const startedAt = Date.now();

    await this.deps.prisma.webhookEvent.update({
      where: { id: event.id },
      data: {
        status: WebhookEventStatus.PROCESSING
      }
    });

    try {
      const payloadString = JSON.stringify(event.payload);

      const signature = crypto
        .createHmac(
          "sha256",
          this.deps.env.WEBHOOK_SIGNING_SECRET
        )
        .update(payloadString)
        .digest("hex");
      const response = await fetch(event.targetUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-signaldock-event-id": event.id,
          "x-signaldock-attempt": String(attemptNumber),
          "x-signaldock-signature": `sha256=${signature}`,
          ...toHeaderRecord(event.headers)
        },
        body: payloadString,
        signal: AbortSignal.timeout(this.deps.env.DELIVERY_TIMEOUT_MS)
      });

      const responseBody = truncate(await response.text());
      const durationMs = Date.now() - startedAt;

      if (!response.ok) {
        throw new HttpDeliveryError(
          `Received non-success response ${response.status}`,
          response.status,
          responseBody
        );
      }

      await this.deps.prisma.$transaction([
        this.deps.prisma.deliveryAttempt.create({
          data: {
            eventId: event.id,
            attemptNumber,
            status: DeliveryAttemptStatus.SUCCESS,
            responseCode: response.status,
            durationMs,
            ...(responseBody !== undefined ? { responseBody } : {})
          }
        }),

        this.deps.prisma.webhookEvent.update({
          where: { id: event.id },
          data: {
            status: WebhookEventStatus.DELIVERED,
            deliveredAt: new Date(),
            lastError: null
          }
        })
      ]);


      this.deps.logger.info(
        { eventId: event.id, attemptNumber, responseCode: response.status },
        "Webhook delivered successfully"
      );
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      const message = error instanceof Error ? error.message : "Unknown delivery error";
      const truncatedMessage = truncate(message) ?? "Unknown delivery error";
      const responseCode = error instanceof HttpDeliveryError ? error.statusCode : undefined;
      const responseBody = error instanceof HttpDeliveryError ? error.responseBody : undefined;
      const truncatedResponseBody = truncate(responseBody);
      const finalAttempt = attemptNumber >= totalAttempts;

      await this.deps.prisma.deliveryAttempt.create({
        data: {
          eventId: event.id,
          attemptNumber,
          status: DeliveryAttemptStatus.FAILED,
          ...(responseCode !== undefined ? { responseCode } : {}),
          ...(truncatedResponseBody !== undefined ? { responseBody: truncatedResponseBody } : {}),
          durationMs,
          errorMessage: truncatedMessage
        }
      });

      if (finalAttempt) {
        await this.deps.prisma.$transaction([
          this.deps.prisma.webhookEvent.update({
            where: { id: event.id },
            data: {
              status: WebhookEventStatus.DEAD_LETTERED,
              deadLetteredAt: new Date(),
              lastError: truncatedMessage
            }
          }),
          this.deps.prisma.deadLetterEvent.upsert({
            where: { eventId: event.id },
            update: {
              reason: truncatedMessage,
              payload: toPrismaJsonValue(event.payload)
            },
            create: {
              eventId: event.id,
              reason: truncatedMessage,
              payload: toPrismaJsonValue(event.payload)
            }
          })
        ]);

        await this.deps.deadLetterQueue.add(
          "dead-lettered-webhook",
          { eventId: event.id },
          {
            jobId: `${event.id}-dead-letter`
          }
        );
      } else {
        await this.deps.prisma.webhookEvent.update({
          where: { id: event.id },
          data: {
            status: WebhookEventStatus.RETRYING,
            lastError: truncatedMessage
          }
        });
      }

      this.deps.logger.error(
        { err: error, eventId: event.id, attemptNumber, finalAttempt },
        "Webhook delivery attempt failed"
      );

      throw error;
    }
  }
}
