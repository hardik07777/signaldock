import { Counter, Registry } from "prom-client";

export const registry = new Registry();

export const eventsTotal = new Counter({
  name: "signaldock_events_total",
  help: "Total webhook events created",
  registers: [registry]
});

export const deliveredTotal = new Counter({
  name: "signaldock_delivered_total",
  help: "Total delivered webhooks",
  registers: [registry]
});

export const deadLetteredTotal = new Counter({
  name: "signaldock_dead_lettered_total",
  help: "Total dead lettered webhooks",
  registers: [registry]
});

export const deliveryAttemptsTotal = new Counter({
  name: "signaldock_delivery_attempts_total",
  help: "Total delivery attempts",
  registers: [registry]
});