import type { FastifyInstance } from "fastify";

import { DashboardService } from "./dashboard.service";

interface RegisterDashboardRoutesOptions {
  service: DashboardService;
}

export async function registerDashboardRoutes(
  app: FastifyInstance,
  options: RegisterDashboardRoutesOptions
) {
  app.get("/v1/dashboard/stats", async () => {
    return options.service.getStats();
  });
}