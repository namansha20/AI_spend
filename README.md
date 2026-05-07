# AI Spend Auditor

AI Spend Auditor is a free web app for startup founders and engineering managers to quickly identify overspend across AI subscriptions and API usage. Users enter their stack, get an instant savings audit, and can capture a report without any login.

## Screenshots / recording
1. Landing + spend input form: `docs/screenshots/landing.png`
2. Audit result breakdown + savings hero: `docs/screenshots/audit-result.png`
3. Lead capture section on result page: `docs/screenshots/lead-capture.png`

## Quick start
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

### Deploy
Deploy on Vercel/Netlify/Render with these optional environment variables:
- `ANTHROPIC_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_AUDITS_TABLE` (default: `audits`)
- `SUPABASE_LEADS_TABLE` (default: `leads`)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## Decisions (trade-offs)
1. **Rule-based audit math over LLM math** to keep recommendations deterministic and finance-defensible.
2. **Anthropic only for narrative summary** so AI failure cannot break core audit output.
3. **Supabase REST (no SDK)** to keep dependency footprint low while still using a real backend.
4. **Honeypot + in-memory rate limit** as lightweight abuse protection for MVP speed.
5. **Public report strips PII by design** to make sharing safe while preserving viral savings proof.

## Abuse protection
- Hidden honeypot field in lead form (`website`)
- Per-IP rate limit on `/api/lead` (10 requests/minute)

## Deployed URL
https://example-ai-spend-auditor.vercel.app
