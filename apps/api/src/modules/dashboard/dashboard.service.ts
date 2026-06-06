import {
  WebhookEventStatus,
  type PrismaClient
} from "@prisma/client";

interface DashboardServiceDeps {
  prisma: PrismaClient;
}

export class DashboardService {
  constructor(private readonly deps: DashboardServiceDeps) {}

  async getStats() {
    const totalEvents =
      await this.deps.prisma.webhookEvent.count();

    const delivered =
      await this.deps.prisma.webhookEvent.count({
        where: {
          status: WebhookEventStatus.DELIVERED
        }
      });

    const pending =
      await this.deps.prisma.webhookEvent.count({
        where: {
          status: {
            in: [
              WebhookEventStatus.PENDING,
              WebhookEventStatus.PROCESSING,
              WebhookEventStatus.RETRYING
            ]
          }
        }
      });

    const deadLettered =
      await this.deps.prisma.webhookEvent.count({
        where: {
          status: WebhookEventStatus.DEAD_LETTERED
        }
      });

    const successRate =
      totalEvents === 0
        ? 0
        : Number(
            (
              (delivered / totalEvents) *
              100
            ).toFixed(2)
          );

    return {
      totalEvents,
      delivered,
      pending,
      deadLettered,
      successRate
    };
  }
}