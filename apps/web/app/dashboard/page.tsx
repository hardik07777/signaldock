"use client";

import { useEffect, useState } from "react";
import { api } from "../../src/lib/api";

export default function DashboardPage() {
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [queueStats, setQueueStats] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [events, dashboard, queue] = await Promise.all([
          api.get("/v1/webhook-events?page=1&limit=5"),
          api.get("/v1/dashboard/stats"),
          api.get("/v1/admin/queues/stats"),
        ]);

        setRecentEvents(events.data.items ?? []);
        setDashboardStats(dashboard.data);
        setQueueStats(queue.data);
      } catch (error) {
        console.error("Failed to load SignalDock dashboard:", error);
      }
    }

    load();
  }, []);

  return (
    <main className="p-8">
      <h1 className="mb-8 text-4xl font-bold">SignalDock Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-sm text-gray-500">Total Events</h2>
          <p className="text-3xl font-bold">{dashboardStats?.totalEvents ?? "-"}</p>
        </div>
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-sm text-gray-500">Delivered</h2>
          <p className="text-3xl font-bold">{dashboardStats?.delivered ?? "-"}</p>
        </div>
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-sm text-gray-500">Dead Lettered</h2>
          <p className="text-3xl font-bold">{dashboardStats?.deadLettered ?? "-"}</p>
        </div>
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-sm text-gray-500">Success Rate</h2>
          <p className="text-3xl font-bold">{dashboardStats?.successRate ?? "-"}%</p>
        </div>
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-sm text-gray-500">Queue Completed</h2>
          <p className="text-3xl font-bold">{queueStats?.completed ?? "-"}</p>
        </div>
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-sm text-gray-500">Queue Failed</h2>
          <p className="text-3xl font-bold">{queueStats?.failed ?? "-"}</p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-bold">Recent Events</h2>
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Target URL</th>
                <th className="p-4 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((event) => (
                <tr key={event.id} className="border-b">
                  <td className="p-4">{event.status}</td>
                  <td className="break-all p-4">{event.targetUrl}</td>
                  <td className="p-4">{new Date(event.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {recentEvents.length === 0 && (
                <tr>
                  <td className="p-4 text-gray-500" colSpan={3}>
                    No webhook events yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
