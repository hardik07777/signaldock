"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliveryAttemptsTotal = exports.deadLetteredTotal = exports.deliveredTotal = exports.eventsTotal = exports.registry = void 0;
const prom_client_1 = require("prom-client");
exports.registry = new prom_client_1.Registry();
exports.eventsTotal = new prom_client_1.Counter({
    name: "signaldock_events_total",
    help: "Total webhook events created",
    registers: [exports.registry]
});
exports.deliveredTotal = new prom_client_1.Counter({
    name: "signaldock_delivered_total",
    help: "Total delivered webhooks",
    registers: [exports.registry]
});
exports.deadLetteredTotal = new prom_client_1.Counter({
    name: "signaldock_dead_lettered_total",
    help: "Total dead lettered webhooks",
    registers: [exports.registry]
});
exports.deliveryAttemptsTotal = new prom_client_1.Counter({
    name: "signaldock_delivery_attempts_total",
    help: "Total delivery attempts",
    registers: [exports.registry]
});
//# sourceMappingURL=registry.js.map