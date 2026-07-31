"use client";

import { useEffect, useState } from "react";
import { api } from "../../src/lib/api";
import Link from "next/link";

interface EventItem {
  id: string;
  targetUrl: string;
  status: string;
  createdAt: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.id
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      event.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

useEffect(() => {
  async function load() {
    setLoading(true);

    try {
      const response = await api.get(
        `/v1/webhook-events?page=${page}&limit=20`
      );

      setEvents(response.data.items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  load();
}, [page]);

if (loading) {
  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">
        Events
      </h1>

      <div className="h-96 rounded-xl bg-slate-200 animate-pulse" />
    </main>
  );
}

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">
        Events
      </h1>
      <p className="text-gray-500 mb-6">
        {filteredEvents.length} events found
      </p>

      <div className="flex gap-4 mb-6">
  <input
    type="text"
    placeholder="Search Event ID..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border rounded-lg px-4 py-2 flex-1"
  />

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="border rounded-lg px-4 py-2"
  >
    <option value="ALL">All</option>
    <option value="DELIVERED">Delivered</option>
    <option value="DEAD_LETTERED">Dead Lettered</option>
    <option value="PENDING">Pending</option>
  </select>
</div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-4">
                Status
              </th>
              <th className="text-left p-4">
                Target URL
              </th>
              <th className="text-left p-4">
                Created
              </th>
              <th className="text-left p-4">
                Event ID
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredEvents.map((event) => (
              <tr
                key={event.id}
                className="border-b hover:bg-slate-50 transition"
              >
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      event.status === "DELIVERED"
                        ? "bg-green-100 text-green-700"
                        : event.status === "DEAD_LETTERED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {event.status}
                  </span>
                </td>   

                <td className="p-4">
                <a
                  href={event.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {event.targetUrl}
                </a>
                </td>

                <td className="p-4">
                  {new Date(
                    event.createdAt
                  ).toLocaleString()}
                </td>

                <td className="p-4 font-mono text-xs">
              <Link
                    href={`/events/${event.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {event.id}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end gap-4 mt-6">
  <button
  disabled={page === 1}
  onClick={() => setPage(page - 1)}
  className="border px-4 py-2 rounded disabled:opacity-50"
>
    Previous
  </button>

  <span>
    Page {page}
  </span>

  <button
    onClick={() => setPage((p) => p + 1)}
    className="border px-4 py-2 rounded"
  >
    Next
  </button>
</div>
      </div>
    </main>
  );
}