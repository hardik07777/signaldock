import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SignalDock",
  description: "Webhook Delivery Platform Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 border-r bg-white p-6">
            <div className="mb-10">
              <h1 className="text-2xl font-bold">
                ⚡ SignalDock
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Webhook Delivery Platform
              </p>
            </div>

            <nav className="flex flex-col gap-3">
              <Link
                href="/"
                className="rounded-lg px-3 py-2 hover:bg-slate-100 transition"
              >
                📊 Dashboard
              </Link>

              <Link
                href="/events"
                className="rounded-lg px-3 py-2 hover:bg-slate-100 transition"
              >
                📦 Events
              </Link>

              <Link
                href="/dead-letters"
                className="rounded-lg px-3 py-2 hover:bg-slate-100 transition"
              >
                🚨 Dead Letters
              </Link>
              <Link
                href="/events/new"
                className="rounded-lg px-3 py-2 hover:bg-slate-100 transition"
              >
                ➕ Create Event
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}