"use client";

import { use, useEffect, useState } from "react";
import { api } from "../../../src/lib/api";

interface Attempt {
  id: string;
  attemptNumber: number;
  status: string;
  durationMs: number;
  errorMessage: string | null;
  createdAt: string;
}

interface EventDetails {
  id: string;
  targetUrl: string;
  status: string;
  payload: unknown;
  lastError: string | null;
  createdAt: string;
  attempts: Attempt[];
}

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [event, setEvent] =
    useState<EventDetails | null>(null);

  useEffect(() => {
    async function load() {
      const response = await api.get(
        `/v1/webhook-events/${id}`
      );

      setEvent(response.data);
    }

    load();
  }, [id]);

  async function replayEvent() {
    await api.post(
      `/v1/webhook-events/${id}/replay`
    );

    alert("Replay queued");
  }

  if (!event) {
    return (
      <main className="p-8">
        Loading...
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">
        Event Details
      </h1>

      <div className="space-y-4 mb-8">
        <div>
          <strong>Status:</strong>{" "}
          {event.status}
        </div>

        <div>
          <strong>Target URL:</strong>{" "}
          {event.targetUrl}
        </div>

        <div>
          <strong>Created:</strong>{" "}
          {new Date(
            event.createdAt
          ).toLocaleString()}
        </div>

        <div>
          <strong>Last Error:</strong>{" "}
          {event.lastError ?? "None"}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">
          Payload
        </h2>

        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(
            event.payload,
            null,
            2
          )}
        </pre>
      </div>

      <button
        onClick={replayEvent}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-8"
      >
        Replay Event
      </button>

      <h2 className="text-2xl font-bold mb-4">
        Attempt History
      </h2>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="p-2 border">
              Attempt
            </th>
            <th className="p-2 border">
              Status
            </th>
            <th className="p-2 border">
              Duration
            </th>
            <th className="p-2 border">
              Error
            </th>
          </tr>
        </thead>

        <tbody>
          {event.attempts.map((attempt) => (
            <tr key={attempt.id}>
              <td className="p-2 border">
                {attempt.attemptNumber}
              </td>

              <td className="p-2 border">
                {attempt.status}
              </td>

              <td className="p-2 border">
                {attempt.durationMs} ms
              </td>

              <td className="p-2 border">
                {attempt.errorMessage ??
                  "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}