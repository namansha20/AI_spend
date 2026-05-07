# Reflection

## 1) Hardest bug and debugging process
The hardest bug was inconsistent recommendations for API-direct tools. Early rules assumed every plan had a fixed per-seat monthly price, so API direct rows were producing unrealistic “recommended spend = $0.” I hypothesized three causes: (1) missing special-case handling for usage-based plans, (2) a data-shape mismatch from the form, or (3) numeric conversion issues around `monthlySpend`. I added focused console traces around parsed inputs and candidate recommendation costs, then ran the engine against synthetic API-heavy examples. The traces showed fixed-price logic was indeed being used for API rows. I changed benchmark logic so usage-based plans compute a conservative optimization floor (`max(spend*0.85, spend-200)`) and reran tests. This fixed the zero-cost bug and produced defensible, non-magical recommendations.

## 2) Decision reversed mid-week
I initially planned to force users to provide email before generating the report because it seemed better for conversion metrics. After reviewing the assignment constraints and user intent, I reversed the decision: value first, lead capture second. The key trigger was realizing that a frictionless first experience improves trust and likely increases qualified opt-ins anyway. I moved lead capture to the results page, with differentiated messaging for high-savings vs low-savings outcomes.

## 3) What I would build in week 2
Week 2 would focus on benchmark intelligence and conversion instrumentation. I’d add spend-per-developer benchmarking from anonymized aggregated audits, richer API usage inputs (tokens/model mix), and a stronger recommendation explanation panel with confidence levels. On the GTM side, I’d implement referral links and a founder-facing “share to compare” workflow. On engineering, I’d switch to a durable queue for email/AI jobs and add analytics pipelines for funnel analysis.

## 4) How I used AI tools
I used AI for drafting copy variants (landing and summary tone), scaffolding repetitive boilerplate, and stress-testing edge-case reasoning in the recommendation rules. I did not trust AI with final pricing numbers or business logic thresholds; those stayed deterministic and manually reviewed. One specific AI mistake I caught: it proposed recommending enterprise plans as cost-saving options for small teams because it optimized for token limits, not spend. I rejected that and added explicit seat/minimum checks.

## 5) Self-rating
- **Discipline: 8/10** — kept daily execution cadence with explicit next-day plans.
- **Code quality: 8/10** — clear module split (catalog, engine, API, storage), typed frontend.
- **Design sense: 7/10** — clean and readable MVP UI, but room for stronger brand polish.
- **Problem-solving: 8/10** — resolved API-direct pricing edge cases with targeted hypotheses/tests.
- **Entrepreneurial thinking: 8/10** — focused on honest value delivery and lead quality over vanity conversion.
