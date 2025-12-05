"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Job = {
  id: string;
  start_time: string;
  price_cents: number;
  status: string;
};

export default function DashboardPage() {
  const [jobsToday, setJobsToday] = useState<Job[]>([]);
  const [jobsThisWeek, setJobsThisWeek] = useState<Job[]>([]);
  const [upcomingJobs, setUpcomingJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const endOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );

      // start of week (Sunday or Monday, depending how you wanna roll)
      const day = now.getDay(); // 0 = Sunday
      const startOfWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - day
      );

      // Today
      const { data: todayData } = await supabase
        .from("jobs")
        .select("id, start_time, price_cents, status")
        .gte("start_time", startOfToday.toISOString())
        .lt("start_time", endOfToday.toISOString());

      // This week
      const { data: weekData } = await supabase
        .from("jobs")
        .select("id, start_time, price_cents, status")
        .gte("start_time", startOfWeek.toISOString())
        .lt("start_time", endOfToday.toISOString());

      // Upcoming (next 7 days)
      const nextWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 7
      );

      const { data: upcomingData } = await supabase
        .from("jobs")
        .select("id, start_time, price_cents, status")
        .gte("start_time", now.toISOString())
        .lt("start_time", nextWeek.toISOString())
        .order("start_time", { ascending: true });

      setJobsToday(todayData || []);
      setJobsThisWeek(weekData || []);
      setUpcomingJobs(upcomingData || []);

      setLoading(false);
    };

    fetchStats();
  }, []);

  const sumRevenue = (jobs: Job[]) =>
    jobs.reduce((acc, job) => acc + (job.price_cents || 0), 0) / 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Overview of your work in the field.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Jobs Today
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {loading ? "…" : jobsToday.length}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            This Week&apos;s Revenue
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {loading ? "…" : `$${sumRevenue(jobsThisWeek).toFixed(2)}`}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Upcoming Jobs (7 days)
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {loading ? "…" : upcomingJobs.length}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Next Up
        </h2>
        {loading ? (
          <p className="mt-2 text-sm text-slate-600">Loading…</p>
        ) : upcomingJobs.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            No upcoming jobs scheduled.
          </p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {upcomingJobs.slice(0, 5).map((job) => (
              <li key={job.id}>
                {new Date(job.start_time).toLocaleString()} —{" "}
                <span className="uppercase text-xs text-slate-500">
                  {job.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}