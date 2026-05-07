import { NextResponse } from "next/server";
import { evaluateAudit } from "@/lib/audit-engine";
import { saveAudit } from "@/lib/storage";
import { generateSummary } from "@/lib/summary";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const audit = evaluateAudit(body);
    const summary = await generateSummary(audit);
    const finalAudit = { ...audit, summary };
    await saveAudit(finalAudit);

    return NextResponse.json({ id: finalAudit.id, summary: finalAudit.summary });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate audit",
        details: error instanceof Error ? error.message : "unknown error",
      },
      { status: 500 }
    );
  }
}
