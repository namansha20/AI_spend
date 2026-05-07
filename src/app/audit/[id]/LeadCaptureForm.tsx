"use client";

import { useState } from "react";

export default function LeadCaptureForm({ auditId }: { auditId: string }) {
  const [status, setStatus] = useState<string>("");

  async function onSubmit(formData: FormData) {
    setStatus("Saving...");
    const payload = {
      auditId,
      email: formData.get("email"),
      companyName: formData.get("companyName"),
      role: formData.get("role"),
      teamSize: Number(formData.get("teamSize") || 0),
      website: formData.get("website"),
    };

    const response = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setStatus("Could not save your lead. Please retry.");
      return;
    }

    setStatus("Saved. We sent a confirmation email.");
  }

  return (
    <form
      className="mt-4 grid gap-2"
      action={(data) => {
        void onSubmit(data);
      }}
    >
      <input className="border rounded px-3 py-2" type="email" name="email" placeholder="you@company.com" required />
      <input className="border rounded px-3 py-2" type="text" name="companyName" placeholder="Company name (optional)" />
      <input className="border rounded px-3 py-2" type="text" name="role" placeholder="Role (optional)" />
      <input className="border rounded px-3 py-2" type="number" name="teamSize" placeholder="Team size (optional)" min={1} />
      <input className="hidden" type="text" name="website" tabIndex={-1} autoComplete="off" />
      <button className="bg-black text-white rounded px-4 py-2" type="submit">Capture my report</button>
      <p className="text-sm">{status}</p>
    </form>
  );
}
