"use client";

import { useState } from "react";
import { api } from "../../../src/lib/api";

export default function CreateEventPage() {
  const [targetUrl, setTargetUrl] =
    useState("");

  const [payload, setPayload] =
    useState(`{
  "message": "Hello SignalDock"
}`);

  const [maxAttempts, setMaxAttempts] =
    useState(5);

  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setSubmitting(true);

      await api.post(
        "/v1/webhook-events",
        {
          targetUrl,
          payload: JSON.parse(payload),
          maxAttempts,
        }
      );

      alert("Event created successfully");

      setTargetUrl("");

      setPayload(`{
  "message": "Hello SignalDock"
}`);
    } catch (error) {
      console.error(error);

      alert(
        "Failed to create event"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">
        Create Event
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <label className="block mb-2 font-medium">
            Target URL
          </label>

          <input
            type="url"
            value={targetUrl}
            onChange={(e) =>
              setTargetUrl(
                e.target.value
              )
            }
            className="w-full border rounded-lg p-3"
            placeholder="https://webhook.site/..."
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Payload JSON
          </label>

          <textarea
            rows={10}
            value={payload}
            onChange={(e) =>
              setPayload(
                e.target.value
              )
            }
            className="w-full border rounded-lg p-3 font-mono"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Max Attempts
          </label>

          <input
            type="number"
            min={1}
            max={25}
            value={maxAttempts}
            onChange={(e) =>
              setMaxAttempts(
                Number(
                  e.target.value
                )
              )
            }
            className="border rounded-lg p-3"
          />
        </div>

        <button
          disabled={submitting}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
        >
          {submitting
            ? "Creating..."
            : "Create Event"}
        </button>
      </form>
    </main>
  );
}