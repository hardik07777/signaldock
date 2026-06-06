import type { FastifyInstance } from "fastify";

import {
  deadLetterListQuerySchema,
  deadLetterParamsSchema
} from "./dead-letters.schema";

import { DeadLettersService } from "./dead-letters.service";

interface RegisterDeadLetterRoutesOptions {
  service: DeadLettersService;
}

export async function registerDeadLetterRoutes(
  app: FastifyInstance,
  options: RegisterDeadLetterRoutesOptions
) {
  app.get("/v1/dead-letters", async (request) => {
    const query = deadLetterListQuerySchema.parse(
      request.query
    );

    return options.service.listDeadLetters(
      query.page,
      query.limit
    );
  });

  app.get(
    "/v1/dead-letters/:eventId",
    async (request, reply) => {
      const params = deadLetterParamsSchema.parse(
        request.params
      );

      const deadLetter =
        await options.service.getDeadLetter(
          params.eventId
        );

      if (!deadLetter) {
        return reply.code(404).send({
          message: "Dead letter not found"
        });
      }

      return deadLetter;
    }
  );

  app.post(
    "/v1/dead-letters/:eventId/replay",
    async (request, reply) => {
      const params = deadLetterParamsSchema.parse(
        request.params
      );

      const result =
        await options.service.replayDeadLetter(
          params.eventId
        );

      if (!result) {
        return reply.code(404).send({
          message: "Dead letter not found"
        });
      }

      return reply.code(202).send({
        message: "Dead letter replay queued"
      });
    }
  );

  app.delete(
    "/v1/dead-letters/:eventId",
    async (request, reply) => {
      const params = deadLetterParamsSchema.parse(
        request.params
      );

      await options.service.deleteDeadLetter(
        params.eventId
      );

      return reply.send({
        message: "Dead letter deleted"
      });
    }
  );
}