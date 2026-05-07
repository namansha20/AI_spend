"use client";

import { useEffect, useMemo, useState } from "react";
import { TOOL_CATALOG, USE_CASE_OPTIONS } from "@/lib/catalog";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "ai-spend-audit-form-v1";
type ToolInput = {
  toolKey: string;
  plan: string;
  monthlySpend: number;
  seats: number;
};

type AuditFormState = {
  teamSize: number;
  primaryUseCase: string;
  tools: ToolInput[];
};

const toolOptions = Object.entries(TOOL_CATALOG).map(([key, value]) => ({
  key,
  label: value.name,
  plans: Object.keys(value.plans),
}));

function blankTool() {
  return { toolKey: "cursor", plan: "Pro", monthlySpend: 20, seats: 1 };
}

export default function Home() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<AuditFormState>(() => {
    if (typeof window === "undefined") {
      return {
        teamSize: 5,
        primaryUseCase: "coding",
        tools: [blankTool()],
      };
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : {
          teamSize: 5,
          primaryUseCase: "coding",
          tools: [blankTool()],
        };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  const totalSpend = useMemo(
    () => form.tools.reduce((sum: number, tool: ToolInput) => sum + Number(tool.monthlySpend || 0), 0),
    [form.tools]
  );

  async function submitAudit() {
    setSubmitting(true);
    setError("");

    const response = await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      setSubmitting(false);
      setError("Could not run audit. Please try again.");
      return;
    }

    const data = await response.json();
    router.push(`/audit/${data.id}`);
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">AI Spend Auditor</h1>
        <p className="text-gray-700">Find overspend in your AI stack in under 2 minutes.</p>
      </header>

      <section className="rounded-lg border p-4 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="grid gap-1">
            Team size
            <input
              className="border rounded px-3 py-2"
              type="number"
              min={1}
              value={form.teamSize}
              onChange={(e) => setForm((prev) => ({ ...prev, teamSize: Number(e.target.value) || 1 }))}
            />
          </label>
          <label className="grid gap-1">
            Primary use case
            <select
              className="border rounded px-3 py-2"
              value={form.primaryUseCase}
              onChange={(e) => setForm((prev) => ({ ...prev, primaryUseCase: e.target.value }))}
            >
              {USE_CASE_OPTIONS.map((useCase) => (
                <option key={useCase} value={useCase}>
                  {useCase}
                </option>
              ))}
            </select>
          </label>
        </div>

        <h2 className="font-semibold">Tool spend input</h2>
        {form.tools.map((tool, index) => {
          const selectedTool = toolOptions.find((option) => option.key === tool.toolKey) || toolOptions[0];
          return (
            <div key={index} className="grid md:grid-cols-4 gap-2 border rounded p-3">
              <select
                className="border rounded px-2 py-2"
                value={tool.toolKey}
                onChange={(e) =>
                  setForm((prev) => {
                    const updated = [...prev.tools];
                    const nextTool = toolOptions.find((option) => option.key === e.target.value) || toolOptions[0];
                    updated[index] = { ...updated[index], toolKey: e.target.value, plan: nextTool.plans[0] };
                    return { ...prev, tools: updated };
                  })
                }
              >
                {toolOptions.map((option) => (
                  <option key={option.key} value={option.key}>{option.label}</option>
                ))}
              </select>
              <select
                className="border rounded px-2 py-2"
                value={tool.plan}
                onChange={(e) =>
                  setForm((prev) => {
                    const updated = [...prev.tools];
                    updated[index] = { ...updated[index], plan: e.target.value };
                    return { ...prev, tools: updated };
                  })
                }
              >
                {selectedTool.plans.map((plan) => (
                  <option key={plan} value={plan}>{plan}</option>
                ))}
              </select>
              <input
                className="border rounded px-2 py-2"
                type="number"
                min={0}
                value={tool.monthlySpend}
                onChange={(e) =>
                  setForm((prev) => {
                    const updated = [...prev.tools];
                    updated[index] = { ...updated[index], monthlySpend: Number(e.target.value) || 0 };
                    return { ...prev, tools: updated };
                  })
                }
                placeholder="Monthly spend"
              />
              <input
                className="border rounded px-2 py-2"
                type="number"
                min={1}
                value={tool.seats}
                onChange={(e) =>
                  setForm((prev) => {
                    const updated = [...prev.tools];
                    updated[index] = { ...updated[index], seats: Number(e.target.value) || 1 };
                    return { ...prev, tools: updated };
                  })
                }
                placeholder="Seats"
              />
            </div>
          );
        })}

        <div className="flex gap-2">
          <button
            type="button"
            className="border rounded px-3 py-2"
            onClick={() => setForm((prev) => ({ ...prev, tools: [...prev.tools, blankTool()] }))}
          >
            Add tool
          </button>
          <button
            type="button"
            className="bg-black text-white rounded px-3 py-2"
            disabled={submitting}
            onClick={() => {
              void submitAudit();
            }}
          >
            {submitting ? "Running audit..." : "Run instant audit"}
          </button>
        </div>

        <p className="text-sm text-gray-600">Current declared spend: ${totalSpend}/month</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>
    </main>
  );
}
