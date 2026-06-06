export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonPayload = Exclude<JsonValue, null>;

export interface DeliveryJobData {
  eventId: string;
}

export interface CreateWebhookEventInput {
  targetUrl: string;
  payload: JsonPayload;
  headers?: Record<string, string>;
  maxAttempts?: number;
  idempotencyKey?: string;
}
