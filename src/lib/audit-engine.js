import { ALTERNATIVES, TOOL_CATALOG } from "./catalog.js";

const CREDIT_DISCOUNT = 0.2;

function monthlyBenchmark(planInfo, seats, spend) {
  if (!planInfo || planInfo.apiOnly) {
    return Math.max(spend * 0.85, spend - 200);
  }
  return planInfo.monthlyPerSeat * Math.max(seats, planInfo.minSeats || 1);
}

function cheaperInVendor(toolConfig, seats, currentPlan) {
  const entries = Object.entries(toolConfig.plans)
    .filter(([name, plan]) => {
      if (name === currentPlan || plan.apiOnly) return false;
      if (plan.minSeats && seats < plan.minSeats) return false;
      if (plan.seatCap && seats > plan.seatCap) return false;
      return true;
    })
    .sort((a, b) => a[1].monthlyPerSeat - b[1].monthlyPerSeat);
  return entries[0];
}

function alternativeByUseCase(useCase, currentToolKey, seats) {
  const options = ALTERNATIVES[useCase] || ALTERNATIVES.mixed;
  return options.find((option) => option.toolKey !== currentToolKey && option.monthlyPerSeat > 0)
    ? {
        ...options.find((option) => option.toolKey !== currentToolKey),
        total: options.find((option) => option.toolKey !== currentToolKey).monthlyPerSeat * Math.max(seats, 1),
      }
    : null;
}

function fallbackSummary(result) {
  if (result.totalMonthlySavings < 100) {
    return "Your stack is already efficient for your current team size. We found only light optimizations, so keep your setup and re-check as pricing changes.";
  }

  return `Your team can reduce AI software spend by about $${result.totalMonthlySavings}/month ($${result.totalAnnualSavings}/year) by downgrading over-provisioned plans and using lower-cost equivalents for your workflow.`;
}

export function evaluateAudit(input) {
  const rows = input.tools.filter((row) => row.toolKey && row.plan);
  let totalCurrent = 0;
  let totalRecommended = 0;

  const toolResults = rows.map((row) => {
    const toolConfig = TOOL_CATALOG[row.toolKey];
    const seats = Math.max(Number(row.seats || 1), 1);
    const spend = Math.max(Number(row.monthlySpend || 0), 0);
    const planInfo = toolConfig?.plans[row.plan];
    const expected = monthlyBenchmark(planInfo, seats, spend);

    const vendorOption = toolConfig ? cheaperInVendor(toolConfig, seats, row.plan) : null;
    const vendorCost = vendorOption
      ? vendorOption[1].monthlyPerSeat * Math.max(seats, vendorOption[1].minSeats || 1)
      : Number.POSITIVE_INFINITY;

    const alternative = alternativeByUseCase(input.primaryUseCase, row.toolKey, seats);
    const alternativeCost = alternative ? alternative.total : Number.POSITIVE_INFINITY;

    const creditCost = spend * (1 - CREDIT_DISCOUNT);

    const candidates = [
      {
        action: "Keep current plan",
        recommendedMonthlySpend: Math.min(spend, expected),
        reason: "Current plan appears aligned with your seat count and spend profile.",
      },
      vendorOption
        ? {
            action: `Downgrade to ${vendorOption[0]}`,
            recommendedMonthlySpend: vendorCost,
            reason: `Your ${seats}-seat team can fit on ${vendorOption[0]} without enterprise overhead.`,
          }
        : null,
      alternative
        ? {
            action: `Switch to ${TOOL_CATALOG[alternative.toolKey].name} ${alternative.plan}`,
            recommendedMonthlySpend: alternativeCost,
            reason: `For ${input.primaryUseCase} workflows, similar capability is available at lower recurring cost.`,
          }
        : null,
      {
        action: "Procure through Credex credits",
        recommendedMonthlySpend: creditCost,
        reason: "Same tooling, but discounted credits reduce effective spend for committed usage.",
      },
    ].filter(Boolean);

    const best = candidates.reduce((min, option) =>
      option.recommendedMonthlySpend < min.recommendedMonthlySpend ? option : min
    );

    const savings = Math.max(spend - best.recommendedMonthlySpend, 0);
    const meaningfulSavingsFloor = Math.max(5, spend * 0.1);
    totalCurrent += spend;
    totalRecommended += best.recommendedMonthlySpend;

    return {
      tool: toolConfig?.name || row.toolKey,
      currentPlan: row.plan,
      currentMonthlySpend: spend,
      recommendedAction: savings < meaningfulSavingsFloor ? "Keep current plan" : best.action,
      recommendedMonthlySpend: Number(best.recommendedMonthlySpend.toFixed(2)),
      monthlySavings: Number(savings.toFixed(2)),
      annualSavings: Number((savings * 12).toFixed(2)),
      reason:
        savings < meaningfulSavingsFloor
          ? "You are already close to the lowest defensible cost for this usage." 
          : best.reason,
    };
  });

  const totalMonthlySavings = Number(Math.max(totalCurrent - totalRecommended, 0).toFixed(2));
  const result = {
    id: crypto.randomUUID(),
    generatedAt: new Date().toISOString(),
    teamSize: Number(input.teamSize || 1),
    primaryUseCase: input.primaryUseCase,
    totalCurrentSpend: Number(totalCurrent.toFixed(2)),
    totalRecommendedSpend: Number(totalRecommended.toFixed(2)),
    totalMonthlySavings,
    totalAnnualSavings: Number((totalMonthlySavings * 12).toFixed(2)),
    highSavingsLead: totalMonthlySavings > 500,
    toolResults,
  };

  return {
    ...result,
    summaryFallback: fallbackSummary(result),
    publicReport: {
      id: result.id,
      generatedAt: result.generatedAt,
      primaryUseCase: result.primaryUseCase,
      totalMonthlySavings: result.totalMonthlySavings,
      totalAnnualSavings: result.totalAnnualSavings,
      highSavingsLead: result.highSavingsLead,
      toolResults: result.toolResults,
    },
  };
}
