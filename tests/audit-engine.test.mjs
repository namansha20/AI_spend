import test from "node:test";
import assert from "node:assert/strict";
import { evaluateAudit } from "../src/lib/audit-engine.js";

const baseInput = {
  teamSize: 6,
  primaryUseCase: "coding",
  tools: [{ toolKey: "cursor", plan: "Business", monthlySpend: 300, seats: 6 }],
};

test("recommends lower-cost action when savings exist", () => {
  const result = evaluateAudit(baseInput);
  assert.ok(result.totalMonthlySavings > 0);
  assert.match(result.toolResults[0].recommendedAction, /Downgrade|Switch|Credex/);
});

test("marks high-savings leads above $500/month", () => {
  const result = evaluateAudit({
    ...baseInput,
    tools: [{ toolKey: "claude", plan: "Enterprise", monthlySpend: 2000, seats: 20 }],
  });
  assert.equal(result.highSavingsLead, true);
});

test("keeps plan when spend is already near floor", () => {
  const result = evaluateAudit({
    ...baseInput,
    tools: [{ toolKey: "copilot", plan: "Individual", monthlySpend: 10, seats: 1 }],
  });
  assert.equal(result.toolResults[0].recommendedAction, "Keep current plan");
});

test("produces fallback summary for low savings", () => {
  const result = evaluateAudit({
    ...baseInput,
    tools: [{ toolKey: "copilot", plan: "Individual", monthlySpend: 10, seats: 1 }],
  });
  assert.match(result.summaryFallback, /already efficient/i);
});

test("strips private details from public report", () => {
  const result = evaluateAudit(baseInput);
  assert.equal(result.publicReport.totalMonthlySavings, result.totalMonthlySavings);
  assert.equal(Object.prototype.hasOwnProperty.call(result.publicReport, "email"), false);
});
