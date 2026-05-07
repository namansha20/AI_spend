import { NextResponse } from "next/server";
import { saveLead, getAudit } from "@/lib/storage";
import { sendLeadConfirmationEmail } from "@/lib/summary";

const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const hits = (requestLog.get(ip) || []).filter((stamp) => now - stamp < WINDOW_MS);
  hits.push(now);
  requestLog.set(ip, hits);
  return hits.length > RATE_LIMIT;
}

export async function POST(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();

    if (body.website) {
      return NextResponse.json({ ok: true });
    }

    const audit = await getAudit(body.auditId);
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    const record = await saveLead({
      audit_id: body.auditId,
      email: body.email,
      company_name: body.companyName || null,
      role: body.role || null,
      team_size: body.teamSize || null,
      monthly_savings: audit.totalMonthlySavings,
      high_savings: audit.highSavingsLead,
    });

    await sendLeadConfirmationEmail({
      to: body.email,
      auditId: body.auditId,
      monthlySavings: audit.totalMonthlySavings,
      highSavingsLead: audit.highSavingsLead,
    });

    return NextResponse.json({ ok: true, leadId: record.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lead capture failed" },
      { status: 500 }
    );
  }
}
