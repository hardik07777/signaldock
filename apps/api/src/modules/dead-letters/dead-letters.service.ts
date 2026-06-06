import type { PrismaClient } from "@prisma/client";

import { WebhookEventService } from "../webhook-events/webhook-events.service";

interface DeadLettersServiceDeps {
  prisma: PrismaClient;
  webhookEventService: WebhookEventService;
}

export class DeadLettersService {
  constructor(
    private readonly deps: DeadLettersServiceDeps
  ) {}

  async listDeadLetters(page: number, limit: number) {
    const [items, total] = await Promise.all([
      this.deps.prisma.deadLetterEvent.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          event: true
        }
      }),
      this.deps.prisma.deadLetterEvent.count()
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

  async getDeadLetter(eventId: string) {
    return this.deps.prisma.deadLetterEvent.findUnique({
      where: {
        eventId
      },
      include: {
        event: {
          include: {
            attempts: {
              orderBy: {
                attemptNumber: "asc"
              }
            }
          }
        }
      }
    });
  }

  async replayDeadLetter(eventId: string) {
    return this.deps.webhookEventService.replayEvent(eventId);
  }

  async deleteDeadLetter(eventId: string) {
    return this.deps.prisma.deadLetterEvent.delete({
      where: {
        eventId
      }
    });
  }
}