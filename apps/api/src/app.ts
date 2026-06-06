import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import type { PrismaClient } from "@prisma/client";
import type { Queue } from "bullmq";
import type { DeliveryJobData } from "@signaldock/shared";

import type { ApiEnv } from "./config/env";
import { registerHealthRoutes } from "./routes/health";
import { registerWebhookEventRoutes } from "./modules/webhook-events/webhook-events.routes";
import { WebhookEventService } from "./modules/webhook-events/webhook-events.service";
import { AdminService } from "./modules/admin/admin.service";
import { registerAdminRoutes } from "./modules/admin/admin.routes";
import { DashboardService } from "./modules/dashboard/dashboard.service";
import { registerDashboardRoutes } from "./modules/dashboard/dashboard.routes";
import { registerMetricsRoutes } from "./metrics/metrics.routes";
import { DeadLettersService } from "./modules/dead-letters/dead-letters.service";
import { registerDeadLetterRoutes } from "./modules/dead-letters/dead-letters.routes";

interface BuildServerOptions {
  env: ApiEnv;
  prisma: PrismaClient;
  deliveryQueue: Queue<DeliveryJobData>;
  jobName: string;
}

export function buildServer(options: BuildServerOptions) {
  const app = Fastify({
    logger: {
      level: options.env.LOG_LEVEL
    },
    disableRequestLogging: false
  });

  app.register(swagger, {
    openapi: {
      info: {
        title: "SignalDock API",
        description: "Webhook event management API",
        version: "1.0.0"
      },
      servers: [
        {
          url: `http://localhost:${options.env.PORT}`,
          description: "Development server"
        }
      ]
    }
  });

  app.register(swaggerUi as any, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true
    },
    staticCSP: true,
    transformStaticCSP: (header: unknown) => header,
    transformSpecification: (swaggerObject: unknown, _request: unknown, _reply: unknown) => {
      return swaggerObject;
    },
    transformSpecificationClone: true
  });

  const webhookEventService = new WebhookEventService({
    prisma: options.prisma,
    deliveryQueue: options.deliveryQueue,
    logger: app.log,
    defaultMaxAttempts: options.env.DEFAULT_MAX_ATTEMPTS,
    backoffDelayMs: options.env.BACKOFF_DELAY_MS,
    jobName: options.jobName
  });

  const adminService = new AdminService({
    deliveryQueue: options.deliveryQueue
  });
  const dashboardService = new DashboardService({
    prisma: options.prisma
  });

  app.register(registerHealthRoutes);
  app.register(registerWebhookEventRoutes, {
    service: webhookEventService
  });
  app.register(registerAdminRoutes, {
  service: adminService
});
  
app.register(registerDashboardRoutes, {
  service: dashboardService
});
const deadLettersService =
  new DeadLettersService({
    prisma: options.prisma,
    webhookEventService
  });
  app.register(registerDeadLetterRoutes, {
    service: deadLettersService
  });
  app.register(registerMetricsRoutes);

  return app;
}

