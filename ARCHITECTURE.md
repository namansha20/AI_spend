# Architecture

```mermaid
flowchart TD
  A[Visitor opens landing page] --> B[Client form state in localStorage]
  B --> C[POST /api/audit]
  C --> D[Audit engine rule evaluation]
  D --> E[AI summary generation (Anthropic with fallback)]
  E --> F[Persist audit data (Supabase or memory fallback)]
  F --> G[Redirect to /audit/:id public URL]
  G --> H[Result page with OG/Twitter metadata]
  H --> I[Lead form submit POST /api/lead]
  I --> J[Store lead in backend]
  I --> K[Send transactional email via Resend]
```

## Data flow
1. User inputs tools/plans/spend/seats + team size + use case.
2. Form persists to `localStorage` to survive page refresh.
3. API runs deterministic pricing and recommendation rules.
4. API attempts Anthropic summary; if unavailable/failing, uses templated fallback.
5. Audit result is stored and assigned a unique ID.
6. Public result route renders savings, per-tool actions, and CTA.
7. Lead capture stores contact info separately and sends confirmation email.

## Stack choice
I chose **Next.js + TypeScript** for fast full-stack delivery (SSR pages + API routes + metadata generation) in one codebase. Tailwind provides quick UI polish while keeping implementation lightweight. Supabase REST integration keeps backend “real” without SDK lock-in.

## Scaling to 10k audits/day
- Move from in-memory fallback to mandatory managed Postgres/Supabase.
- Add Redis-based distributed rate limiting instead of process memory.
- Queue outbound emails and LLM summary generation (background workers).
- Cache static pricing matrix and precompute recommendation candidates.
- Add observability (request tracing, error budgets, dashboard alerts).
