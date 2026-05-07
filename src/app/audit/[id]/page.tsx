import type { Metadata } from "next";
import { getAudit } from "@/lib/storage";
import { notFound } from "next/navigation";
import LeadCaptureForm from "./LeadCaptureForm";

export const dynamic = "force-dynamic";
type AuditItem = {
  tool: string;
  currentPlan: string;
  currentMonthlySpend: number;
  recommendedAction: string;
  recommendedMonthlySpend: number;
  monthlySavings: number;
  reason: string;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAudit(id);
  if (!audit) {
    return { title: "Audit not found" };
  }

  const title = `AI Spend Audit: Save $${audit.totalMonthlySavings}/mo`;
  const description = `Potential annual savings: $${audit.totalAnnualSavings}.`; 

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await getAudit(id);
  if (!audit) notFound();

  const lowSavings = audit.totalMonthlySavings < 100;

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-3xl font-bold">{lowSavings ? "You’re spending well." : "Your AI Spend Audit"}</h1>
      <p className="text-lg">Potential savings: <strong>${audit.totalMonthlySavings}/month</strong> · <strong>${audit.totalAnnualSavings}/year</strong></p>
      <p className="text-sm text-gray-700">{audit.summary}</p>

      <section className="rounded-lg border p-4 space-y-3">
        {audit.toolResults.map((item: AuditItem) => (
          <div key={`${item.tool}-${item.currentPlan}`} className="border-b pb-3 last:border-b-0">
            <p className="font-semibold">{item.tool} ({item.currentPlan})</p>
            <p>${item.currentMonthlySpend}/mo → {item.recommendedAction} ({item.recommendedMonthlySpend}/mo)</p>
            <p className="text-sm">Savings: ${item.monthlySavings}/mo · {item.reason}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border p-4">
        {audit.highSavingsLead ? (
          <p className="font-semibold text-emerald-700">You have high savings potential (&gt;$500/mo). Talk to Credex to capture discounted credits.</p>
        ) : (
          <p className="font-semibold">We’ll notify you when new optimizations become available for your stack.</p>
        )}
        <LeadCaptureForm auditId={audit.id} />
      </section>

      <p className="text-xs text-gray-500">Public share URL hides private details like company name and email.</p>
    </main>
  );
}
