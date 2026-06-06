# SignalDock

SignalDock is a production-oriented webhook delivery platform built as a TypeScript monorepo. The API accepts webhook events, persists them in PostgreSQL through Prisma, enqueues delivery jobs in BullMQ, and a worker service performs outbound delivery with retries, exponential backoff, and a dead letter queue.

## Monorepo layout

```text
apps/
  api/        Fastify ingestion API
  worker/     BullMQ delivery worker
packages/
  shared/     Shared queue, env, and domain contracts
prisma/
  schema.prisma
  migrations/
docker-compose.yml
```

## Services

- `api`: Receives webhook events and exposes status endpoints.
- `worker`: Delivers webhooks asynchronously and persists attempt history.
- `postgres`: Primary transactional store for events and attempts.
- `redis`: Queue backend for BullMQ.

## Local development

1. Copy `.env.example` to `.env` for local Node processes, or `.env.docker.example` to `.env` before running Docker Compose.
2. Install dependencies with `npm install`.
3. Generate Prisma client with `npm run prisma:generate`.
4. Apply the migration with `npm run prisma:migrate:dev`.
5. Start the API and worker separately or run the Docker stack.

Docker Compose defaults to `.env.docker.example`. If you want a different file, run with `SIGNALDOCK_ENV_FILE=.env docker compose up --build`.

## API endpoints

- `POST /v1/webhook-events`
- `GET /v1/webhook-events/:id`
- `GET /health`

## Delivery flow

1. API validates and stores the incoming event.
2. API enqueues a BullMQ delivery job.
3. Worker fetches the event and performs the outbound HTTP request.
4. Each attempt is recorded in PostgreSQL.
5. Failures retry with exponential backoff.
6. Permanently failed events are marked dead-lettered and copied to the dead letter queue.
