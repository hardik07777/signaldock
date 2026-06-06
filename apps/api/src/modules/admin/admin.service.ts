import type { Queue } from "bullmq";

import type { DeliveryJobData } from "@signaldock/shared";

interface AdminServiceDeps {
  deliveryQueue: Queue<DeliveryJobData>;
}

export class AdminService {
  constructor(private readonly deps: AdminServiceDeps) {}

  async getQueueStats() {
    const counts = await this.deps.deliveryQueue.getJobCounts(
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed"
    );

    return {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
      delayed: counts.delayed ?? 0
    };
  }
}