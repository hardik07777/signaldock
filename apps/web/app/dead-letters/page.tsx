"use client";

import { useEffect, useState } from "react";
import { api } from "../../src/lib/api";
import Link from "next/link";

interface DeadLetter {
  id: string;
  eventId: string;
  reason: string;
  createdAt: string;
  event: {
    targetUrl: string;
    status: string;
  };
}

export default function DeadLettersPage() {
  const [items, setItems] = useState<DeadLetter[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDeadLetters() {
    try {
      const response = await api.get(
        "/v1/dead-letters"
      );

      setItems(response.data.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeadLetters();
  }, []);

  async function replay(eventId: string) {
    await api.post(
      `/v1/dead-letters/${eventId}/replay`
    );

    alert("Replay queued");

    loadDeadLetters();
  }

  async function remove(eventId: string) {
  if (
    !confirm(
      "Delete this dead letter entry?"
    )
  ) {
    return;
  }

  try {
    console.log("Deleting:", eventId);

    const response = await api.delete(
      `/v1/dead-letters/${eventId}`
    );

    console.log(
      "Delete response:",
      response
    );

    alert("Deleted successfully");

    await loadDeadLetters();
  } catch (error) {
    console.error(
      "Delete error:",
      error
    );

    alert("Delete failed");
  }
}

  if (loading) {
    return (
      <main className="p-8">
        Loading...
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">
        Dead Letters
      </h1>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left">
                Event ID
              </th>

              <th className="p-4 text-left">
                Target URL
              </th>

              <th className="p-4 text-left">
                Reason
              </th>

              <th className="p-4 text-left">
                Created
              </th>

              <th className="p-4 text-left">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b"
              >
                <td className="p-4 font-mono text-xs">
                  <Link
  href={`/dead-letters/${item.eventId}`}
  className="text-blue-600 hover:underline"
>
  {item.eventId}
</Link>
                </td>

                <td className="p-4">
                  {item.event.targetUrl}
                </td>

                <td className="p-4 text-red-600">
                  {item.reason}
                </td>

                <td className="p-4">
                  {new Date(
                    item.createdAt
                  ).toLocaleString()}
                </td>

                <td className="p-4 flex gap-2">
                  <button
                    onClick={() =>
                      replay(item.eventId)
                    }
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Replay
                  </button>

                  <button
                    onClick={() =>
                      remove(item.eventId)
                    }
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}