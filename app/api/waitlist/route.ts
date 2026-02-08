import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { resend } from "@/lib/server/resend";
import { supabaseAdmin } from "@/lib/server/supabase";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const rateLimitMap = new Map<string, number[]>();

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClientIp() {
  const headerList = headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return headerList.get("x-real-ip") ?? "unknown";
}

function checkRateLimit(ip: string) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const windowed = timestamps.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  windowed.push(now);
  rateLimitMap.set(ip, windowed);
  return windowed.length <= RATE_LIMIT_MAX;
}

export async function POST(request: Request) {
  const ip = getClientIp();
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = (await request.json()) as {
    wallet?: string;
    email?: string;
  };

  const wallet = body.wallet?.trim();
  const email = body.email?.trim().toLowerCase();

  if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return NextResponse.json(
      { error: "Invalid wallet address." },
      { status: 400 }
    );
  }

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("waitlist").insert({
    wallet,
    email,
    joined_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to save waitlist entry." },
      { status: 500 }
    );
  }

  await resend.emails.send({
    from: "RWAN <noreply@rwan.io>",
    to: email,
    subject: "Welcome to the RWAN Perpdex Waitlist",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to the RWAN Perpdex Waitlist</h2>
        <p>Thanks for joining. You’re now on the list for early access.</p>
        <p>We’ll email you as soon as Perpdex opens.</p>
        <p>— RWAN Team</p>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}
