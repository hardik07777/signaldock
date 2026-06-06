import type { FastifyInstance } from "fastify";
import { registry } from "./registry";

export async function registerMetricsRoutes(
  app: FastifyInstance
) {
  app.get("/metrics", async (_, reply) => {
    reply.header(
      "Content-Type",
      registry.contentType
    );

    return registry.metrics();
  });
}