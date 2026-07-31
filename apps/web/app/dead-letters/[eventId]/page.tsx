"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "../../../src/lib/api";

export default function DeadLetterDetailsPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get(
          `/v1/dead-letters/${eventId}`
        );

        setData(response.data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [eventId]);

  async function replay() {
    await api.post(
      `/v1/dead-letters/${eventId}/replay`
    );

    alert("Replay queued");
  }

  async function remove() {
    const confirmed = confirm(
      "Delete this dead letter?"
    );

    if (!confirmed) return;

    await api.delete(
      `/v1/dead-letters/${eventId}`
    );

    alert("Dead letter deleted");
  }

  if (loading) {
    return (
      <main className="p-8">
        <div className="h-96 bg-slate-200 animate-pulse rounded-xl" />
      </main>
    );
  }

  const event = data.event;

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">
        Dead Letter Details
      </h1>

      <div className="border rounded-xl p-6 mb-8 space-y-4">
        <div>
          <strong>Reason:</strong>{" "}
          <span className="text-red-600">
            {data.reason}
          </span>
        </div>

        <div>
          <strong>Target URL:</strong>{" "}
          {event.targetUrl}
        </div>

        <div>
          <strong>Status:</strong>{" "}
          <span className="px-2 py-1 rounded bg-red-100 text-red-700">
            {event.status}
          </span>
        </div>

        <div>
          <strong>Max Attempts:</strong>{" "}
          {event.maxAttempts}
        </div>

        <div>
          <strong>Created:</strong>{" "}
          {new Date(
            event.createdAt
          ).toLocaleString()}
        </div>

        <div>
          <strong>Last Error:</strong>{" "}
          {event.lastError}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Payload
        </h2>

        <pre className="bg-slate-100 p-4 rounded overflow-auto">
          {JSON.stringify(
            data.payload,
            null,
            2
          )}
        </pre>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={replay}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Replay
        </button>

        <button
          onClick={remove}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4">
        Attempt History
      </h2>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left">
                Attempt
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
                Duration
              </th>

              <th className="p-4 text-left">
                Error
              </th>
            </tr>
          </thead>

          <tbody>
            {event.attempts.map(
              (attempt: any) => (
                <tr
                  key={attempt.id}
                  className="border-b"
                >
                  <td className="p-4">
                    {attempt.attemptNumber}
                  </td>

                  <td className="p-4">
                    <span className="px-2 py-1 rounded bg-red-100 text-red-700">
                      {attempt.status}
                    </span>
                  </td>

                  <td className="p-4">
                    {attempt.durationMs} ms
                  </td>

                  <td className="p-4">
                    {attempt.errorMessage}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}