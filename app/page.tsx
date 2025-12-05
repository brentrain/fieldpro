export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Overview of your day in the field. Jobs, revenue, and what needs your attention.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Jobs Today
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
          <p className="mt-1 text-xs text-slate-500">
            Once you add jobs, you&apos;ll see them tracked here.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            This Week&apos;s Revenue
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">$0</p>
          <p className="mt-1 text-xs text-slate-500">
            Completed jobs will roll up into this total.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Unpaid Invoices
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
          <p className="mt-1 text-xs text-slate-500">
            Keep an eye on who still owes you.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Today&apos;s Schedule
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          When you start adding jobs for clients, your daily schedule will appear here so you always know what&apos;s next.
        </p>
      </div>
    </div>
  );
}