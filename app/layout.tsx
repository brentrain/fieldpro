import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FieldPro",
  description: "Your day, organized. Your jobs, handled.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col bg-slate-100">
          {/* Top Nav */}
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
                  FP
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-slate-900">
                    FieldPro
                  </span>
                  <span className="text-xs text-slate-500">
                    Your day, organized. Your jobs, handled.
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Main area with sidebar + content */}
          <div className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-4 md:py-6">
            {/* Sidebar */}
            <aside className="hidden w-56 border-r border-slate-200 bg-slate-50/80 md:block">
              <nav className="space-y-1 p-3 text-sm">
                <a
                  href="/"
                  className="flex items-center rounded-md bg-white px-3 py-2 font-medium text-slate-800 shadow-sm"
                >
                  Dashboard
                </a>
                <a
                  href="/clients"
                  className="flex items-center rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100"
                >
                  Clients
                </a>
                <a
                  href="/jobs"
                  className="flex items-center rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100"
                >
                  Jobs
                </a>
                <a
                  href="/settings"
                  className="flex items-center rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100"
                >
                  Settings
                </a>
              </nav>
            </aside>

            {/* Page content */}
            <main className="flex-1 md:pl-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}