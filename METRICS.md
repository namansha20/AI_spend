# Metrics

**North Star metric:** Monthly qualified savings pipeline generated (sum of estimated monthly savings from audits that also capture an email).

Why: this aligns user value (real savings found) with business value (high-intent leads likely to convert). Raw traffic or DAU can grow while pipeline quality stays poor.

## 3 input metrics
1. **Audit completion rate** (landing visit → successful audit)
2. **Lead capture rate post-audit** (audit complete → email submitted)
3. **High-savings share** (% audits with >$500/mo savings)

These three directly multiply into qualified pipeline volume and indicate where the funnel is leaking.

## What to instrument first
- Page view + source/referrer on landing
- Form start and form submit events
- Audit generated event with savings bucket
- Lead submitted event with anti-spam pass/fail
- Consultation CTA click from high-savings pages

## Pivot trigger
If after 500 completed audits the high-savings share is below 8% **and** consultation click-through from high-savings reports is below 10%, pivot recommendation strategy and target segment (likely too broad/low-spend audience).
