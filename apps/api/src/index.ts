import { loadApiEnv } from "./config/env";
import { createPrismaClient } from "./lib/prisma";
import { createQueues } from "./lib/queue";
import { buildServer } from "./app";

async function main() {
  const env = loadApiEnv();
  const prisma = createPrismaClient();
  const { deliveryQueue, jobName } = createQueues(env);
  const app = buildServer({
    env,
    prisma,
    deliveryQueue,
    jobName
  });

  const close = async (signal: string) => {
    app.log.info({ signal }, "Shutting down API service");
    await app.close();
    await deliveryQueue.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => void close("SIGINT"));
  process.on("SIGTERM", () => void close("SIGTERM"));

  await app.listen({
    host: env.API_HOST,
    port: env.PORT
  });
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
