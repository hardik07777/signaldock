import { createLogger } from "@signaldock/shared";

import { loadWorkerEnv } from "./config/env";
import { createPrismaClient } from "./lib/prisma";
import { createWorkerRuntime } from "./lib/queues";
import { DeliveryService } from "./services/delivery.service";

async function main() {
  const env = loadWorkerEnv();
  const logger = createLogger({ name: "signaldock-worker" });
  const prisma = createPrismaClient();

  let deliveryService: DeliveryService;

  const runtime = createWorkerRuntime(env, async (job) => {
    await deliveryService.process(job);
  });

  deliveryService = new DeliveryService({
    prisma,
    deadLetterQueue: runtime.deadLetterQueue,
    env,
    logger
  });

  runtime.worker.on("completed", (job) => {
    logger.info({ jobId: job.id, eventId: job.data.eventId }, "Delivery job completed");
  });

  runtime.worker.on("failed", (job, error) => {
    logger.error(
      {
        jobId: job?.id,
        eventId: job?.data.eventId,
        error: error.message
      },
      "Delivery job failed"
    );
  });

  runtime.queueEvents.on("error", (error) => {
    logger.error({ err: error }, "Queue events stream error");
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down worker service");
    await runtime.queueEvents.close();
    await runtime.worker.close();
    await runtime.deadLetterQueue.close();
    await runtime.workerConnection.quit();
    await runtime.queueEventsConnection.quit();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  logger.info(
    { queue: "webhook-delivery", concurrency: env.WORKER_CONCURRENCY },
    "Worker is listening for delivery jobs"
  );
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
