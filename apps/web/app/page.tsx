"use client";

import { useEffect, useState } from "react";
import { api } from "../src/lib/api";
export default function HomePage() {
  const [dashboardStats, setDashboardStats] =
    useState<any>(null);

  const [queueStats, setQueueStats] =
    useState<any>(null);
  
    const [recentEvents, setRecentEvents] =
  useState<any[]>([]);

  useEffect(() => {
    
    async function load() {
      const events = await api.get(
  "/v1/webhook-events?page=1&limit=5"
);

setRecentEvents(events.data.items);
      const dashboard =
        await api.get("/v1/dashboard/stats");

      const queue =
        await api.get(
          "/v1/admin/queues/stats"
        );

      setDashboardStats(dashboard.data);
      setQueueStats(queue.data);
    }

    load();
  }, []);

  return (
  <main className="p-8">
    <h1 className="text-4xl font-bold mb-8">
      SignalDock Dashboard
    </h1>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="border rounded-xl p-6">
        <h2 className="text-sm text-gray-500">
          Total Events
        </h2>
        <p className="text-3xl font-bold">
          {dashboardStats?.totalEvents ?? "-"}
        </p>
      </div>

      <div className="border rounded-xl p-6">
        <h2 className="text-sm text-gray-500">
          Delivered
        </h2>
        <p className="text-3xl font-bold">
          {dashboardStats?.delivered ?? "-"}
        </p>
      </div>

      <div className="border rounded-xl p-6">
        <h2 className="text-sm text-gray-500">
          Dead Lettered
        </h2>
        <p className="text-3xl font-bold">
          {dashboardStats?.deadLettered ?? "-"}
        </p>
      </div>

      <div className="border rounded-xl p-6">
        <h2 className="text-sm text-gray-500">
          Success Rate
        </h2>
        <p className="text-3xl font-bold">
          {dashboardStats?.successRate ?? "-"}%
        </p>
      </div>

      <div className="border rounded-xl p-6">
        <h2 className="text-sm text-gray-500">
          Queue Completed
        </h2>
        <p className="text-3xl font-bold">
          {queueStats?.completed ?? "-"}
        </p>
      </div>

      <div className="border rounded-xl p-6">
        <h2 className="text-sm text-gray-500">
          Queue Failed
        </h2>
        <p className="text-3xl font-bold">
          {queueStats?.failed ?? "-"}
        </p>
      </div>
      <div className="mt-10">
  <h2 className="text-2xl font-bold mb-4">
    Recent Events
  </h2>

  <div className="border rounded-xl overflow-hidden">
    <table className="w-full">
      <thead>
        <tr className="border-b bg-gray-50">
          <th className="p-4 text-left">
            Status
          </th>

          <th className="p-4 text-left">
            Target URL
          </th>

          <th className="p-4 text-left">
            Created
          </th>
        </tr>
      </thead>

      <tbody>
        {recentEvents.map((event) => (
          <tr
            key={event.id}
            className="border-b"
          >
            <td className="p-4">
              {event.status}
            </td>

            <td className="p-4">
              {event.targetUrl}
            </td>

            <td className="p-4">
              {new Date(
                event.createdAt
              ).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
    </div>
  </main>
);
}