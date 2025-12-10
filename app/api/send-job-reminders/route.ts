import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabaseClient";

// Note: Install resend package with: npm install resend
// @ts-ignore - Resend may not be installed
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const notifyEmail = process.env.NOTIFY_EMAIL;

export async function GET() {
  if (!resend) {
    return NextResponse.json(
      { error: "Resend package not installed. Run: npm install resend" },
      { status: 500 }
    );
  }

  if (!notifyEmail) {
    return NextResponse.json(
      { error: "NOTIFY_EMAIL is not set" },
      { status: 500 }
    );
  }

  try {
    // Define "today" in UTC (simple version)
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

    // Fetch today's jobs
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select(
        `
        id,
        scheduled_at,
        price_cents,
        status,
        notes,
        clients:client_id ( name )
      `
      )
      .gte("scheduled_at", startOfToday.toISOString())
      .lt("scheduled_at", endOfToday.toISOString())
      .order("scheduled_at", { ascending: true });

    if (jobsError) {
      console.error("Error loading jobs:", jobsError);
      return NextResponse.json(
        { error: jobsError.message },
        { status: 500 }
      );
    }

    if (!jobs || jobs.length === 0) {
      // No jobs today; optional: skip sending
      return NextResponse.json(
        { message: "No jobs scheduled for today." },
        { status: 200 }
      );
    }

    const formatPrice = (cents: number | null) =>
      cents != null ? `$${(cents / 100).toFixed(2)}` : "-";

    type JobWithClient = {
      id: string;
      scheduled_at: string;
      price_cents: number | null;
      status: string;
      notes: string | null;
      clients: { name: string }[] | null;
    };

    const listItemsHtml = (jobs as JobWithClient[])
      .map((job) => {
        const clientName = job.clients?.[0]?.name ?? "Unknown client";
        const when = new Date(job.scheduled_at).toLocaleString();
        const price = formatPrice(job.price_cents);
        const status = job.status;

        return `<li>
          <strong>${clientName}</strong><br/>
          ${when}<br/>
          Price: ${price}<br/>
          Status: ${status}<br/>
          ${job.notes ? `<em>${job.notes}</em>` : ""}
        </li>`;
      })
      .join("");

    const html = `
      <div>
        <h2>Today's Jobs</h2>
        <p>Here are your jobs scheduled for today:</p>
        <ul>
          ${listItemsHtml}
        </ul>
        <p style="font-size: 12px; color: #666;">Sent by FieldPro.</p>
      </div>
    `;

    const { error: emailError } = await resend.emails.send({
      from: "FieldPro <noreply@yourdomain.com>",
      to: [notifyEmail],
      subject: `Today's jobs (${jobs.length})`,
      html,
    });

    if (emailError) {
      console.error("Email send error:", emailError);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: `Reminder email sent to ${notifyEmail}`, count: jobs.length },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}