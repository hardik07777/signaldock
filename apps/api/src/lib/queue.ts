import { JOB_NAMES, createDeliveryQueue } from "@signaldock/shared";

import type { ApiEnv } from "../config/env";

export function createQueues(env: ApiEnv) {
  const deliveryQueue = createDeliveryQueue(env.REDIS_URL, env.QUEUE_PREFIX, {
    attempts: env.DEFAULT_MAX_ATTEMPTS,
    backoff: {
      type: "exponential",
      delay: env.BACKOFF_DELAY_MS
    },
    removeOnComplete: 5000,
    removeOnFail: 10000
  });

  return {
    deliveryQueue,
    jobName: JOB_NAMES.deliverWebhook
  };
}
