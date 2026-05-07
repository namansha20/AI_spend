# Automated tests

1. `tests/audit-engine.test.mjs` — recommends lower-cost action when savings exist.
2. `tests/audit-engine.test.mjs` — flags high-savings leads above $500/month.
3. `tests/audit-engine.test.mjs` — preserves “keep plan” when spend is already near-optimal.
4. `tests/audit-engine.test.mjs` — verifies low-savings fallback summary behavior.
5. `tests/audit-engine.test.mjs` — verifies public report strips private fields.

## Run tests
```bash
npm test
```
