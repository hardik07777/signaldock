import {
  QUEUE_NAMES,
  createDeadLetterQueue,
  createRedisConnection
} from "@signaldock/shared";
import { QueueEvents, Worker } from "bullmq";

import type { DeliveryJobData } from "@signaldock/shared";

import type { WorkerEnv } from "../config/env";

export function createWorkerRuntime(
  env: WorkerEnv,
  processor: (job: import("bullmq").Job<DeliveryJobData>) => Promise<void>
) {
  const workerConnection = createRedisConnection(env.REDIS_URL);
  const queueEventsConnection = createRedisConnection(env.REDIS_URL);
  const deadLetterQueue = createDeadLetterQueue(env.REDIS_URL, env.QUEUE_PREFIX);

  const worker = new Worker<DeliveryJobData>(QUEUE_NAMES.delivery, processor, {
    connection: workerConnection as any,
    prefix: env.QUEUE_PREFIX,
    concurrency: env.WORKER_CONCURRENCY
  });

  const queueEvents = new QueueEvents(QUEUE_NAMES.delivery, {
    connection: queueEventsConnection as any,
    prefix: env.QUEUE_PREFIX
  });

  return {
    worker,
    queueEvents,
    deadLetterQueue,
    workerConnection,
    queueEventsConnection
  };
}
