
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <div className={isLandingPage ? "min-h-screen" : "flex min-h-screen"}>
      {!isLandingPage && (
        <aside className="w-64 shrink-0 border-r bg-white p-6">
          <div className="mb-10">
            <Link
              href="/"
              className="text-2xl font-bold transition hover:opacity-80"
            >
              ⚡ SignalDock
            </Link>

            <p className="mt-1 text-sm text-gray-500">
              Webhook Delivery Platform
            </p>
          </div>

          <nav
            className="flex flex-col gap-3"
            aria-label="Dashboard navigation"
          >
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 transition hover:bg-slate-100"
            >
              📊 Dashboard
            </Link>

            <Link
              href="/events"
              className="rounded-lg px-3 py-2 transition hover:bg-slate-100"
            >
              📦 Events
            </Link>

            <Link
              href="/dead-letters"
              className="rounded-lg px-3 py-2 transition hover:bg-slate-100"
            >
              🚨 Dead Letters
            </Link>

            <Link
              href="/events/new"
              className="rounded-lg px-3 py-2 transition hover:bg-slate-100"
            >
              ➕ Create Event
            </Link>
          </nav>
        </aside>
      )}

      <main
        className={
          isLandingPage
            ? "min-w-0 flex-1"
            : "min-w-0 flex-1 p-6"
        }
      >
        {children}
      </main>
    </div>
  );
}
