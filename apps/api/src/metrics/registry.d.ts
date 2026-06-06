import { Counter, Registry } from "prom-client";
export declare const registry: Registry<"text/plain; version=0.0.4; charset=utf-8">;
export declare const eventsTotal: Counter<string>;
export declare const deliveredTotal: Counter<string>;
export declare const deadLetteredTotal: Counter<string>;
export declare const deliveryAttemptsTotal: Counter<string>;
