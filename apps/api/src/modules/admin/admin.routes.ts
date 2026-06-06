import type { FastifyInstance } from "fastify";

import { AdminService } from "./admin.service";

interface RegisterAdminRoutesOptions {
  service: AdminService;
}

export async function registerAdminRoutes(
  app: FastifyInstance,
  options: RegisterAdminRoutesOptions
) {
  app.get("/v1/admin/queues/stats", async () => {
    return options.service.getQueueStats();
  });
}