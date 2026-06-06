import { Queue, type JobsOptions } from "bullmq";
import IORedis from "ioredis";


export const QUEUE_NAMES = {
  delivery: "webhook-delivery",
  deadLetter: "webhook-dead-letter"
} as const;

export const JOB_NAMES = {
  deliverWebhook: "deliver-webhook"
} as const;

export function createRedisConnection(redisUrl: string) {
  return new IORedis(redisUrl, {
    maxRetriesPerRequest: null
  });
}

export function createDeliveryQueue(
  redisUrl: string,
  prefix: string,
  defaultJobOptions?: JobsOptions
) {
  return new Queue(QUEUE_NAMES.delivery, {
    connection: createRedisConnection(redisUrl) as any,
    prefix,
    ...(defaultJobOptions ? { defaultJobOptions } : {})
  });
}

export function createDeadLetterQueue(redisUrl: string, prefix: string) {
  return new Queue(QUEUE_NAMES.deadLetter, {
    connection: createRedisConnection(redisUrl) as any,
    prefix
  });
}
