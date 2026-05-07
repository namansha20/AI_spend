export const SUMMARY_PROMPT = `You are an AI spend analyst. Write exactly one paragraph around 100 words.
Tone: practical, founder-friendly, numerically precise.
Inputs will include tools, current spend, recommended actions, and savings.
Output constraints:
- Mention monthly + annual savings.
- Mention at least one concrete recommendation.
- If savings are low, say spend is already efficient.
- Never mention confidential data.
- No bullet points.`;

export async function generateSummary(audit) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return audit.summaryFallback;
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 220,
      system: SUMMARY_PROMPT,
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            totalMonthlySavings: audit.totalMonthlySavings,
            totalAnnualSavings: audit.totalAnnualSavings,
            useCase: audit.primaryUseCase,
            perTool: audit.toolResults.map((item) => ({
              tool: item.tool,
              current: item.currentMonthlySpend,
              action: item.recommendedAction,
              savings: item.monthlySavings,
            })),
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    return audit.summaryFallback;
  }

  const data = await response.json();
  return data?.content?.[0]?.text?.trim() || audit.summaryFallback;
}

export async function sendLeadConfirmationEmail({ to, auditId, monthlySavings, highSavingsLead }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from || !to) return;

  const body = {
    from,
    to: [to],
    subject: "Your AI Spend Audit report",
    html: `<p>Thanks for running your AI Spend Audit.</p><p>Report ID: ${auditId}</p><p>Estimated savings: $${monthlySavings}/month.</p><p>${
      highSavingsLead
        ? "A Credex specialist will reach out to discuss credit-backed savings options."
        : "We will notify you as new optimization opportunities appear."
    }</p>`,
  };

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
