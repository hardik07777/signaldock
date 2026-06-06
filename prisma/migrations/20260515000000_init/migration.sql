CREATE TYPE "WebhookEventStatus" AS ENUM (
  'PENDING',
  'PROCESSING',
  'RETRYING',
  'DELIVERED',
  'DEAD_LETTERED'
);

CREATE TYPE "DeliveryAttemptStatus" AS ENUM (
  'SUCCESS',
  'FAILED'
);

CREATE TABLE "WebhookEvent" (
  "id" TEXT NOT NULL,
  "idempotencyKey" TEXT,
  "targetUrl" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "headers" JSONB,
  "status" "WebhookEventStatus" NOT NULL DEFAULT 'PENDING',
  "maxAttempts" INTEGER NOT NULL DEFAULT 5,
  "deliveredAt" TIMESTAMP(3),
  "deadLetteredAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeliveryAttempt" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "attemptNumber" INTEGER NOT NULL,
  "status" "DeliveryAttemptStatus" NOT NULL,
  "responseCode" INTEGER,
  "responseBody" TEXT,
  "durationMs" INTEGER,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeliveryAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeadLetterEvent" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeadLetterEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WebhookEvent_idempotencyKey_key" ON "WebhookEvent"("idempotencyKey");
CREATE INDEX "WebhookEvent_status_createdAt_idx" ON "WebhookEvent"("status", "createdAt");
CREATE INDEX "WebhookEvent_targetUrl_createdAt_idx" ON "WebhookEvent"("targetUrl", "createdAt");

CREATE UNIQUE INDEX "DeliveryAttempt_eventId_attemptNumber_key" ON "DeliveryAttempt"("eventId", "attemptNumber");
CREATE INDEX "DeliveryAttempt_eventId_createdAt_idx" ON "DeliveryAttempt"("eventId", "createdAt");

CREATE UNIQUE INDEX "DeadLetterEvent_eventId_key" ON "DeadLetterEvent"("eventId");

ALTER TABLE "DeliveryAttempt"
  ADD CONSTRAINT "DeliveryAttempt_eventId_fkey"
  FOREIGN KEY ("eventId")
  REFERENCES "WebhookEvent"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "DeadLetterEvent"
  ADD CONSTRAINT "DeadLetterEvent_eventId_fkey"
  FOREIGN KEY ("eventId")
  REFERENCES "WebhookEvent"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
