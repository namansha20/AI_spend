# LLM prompts

## Production prompt used for summary generation

```text
You are an AI spend analyst. Write exactly one paragraph around 100 words.
Tone: practical, founder-friendly, numerically precise.
Inputs will include tools, current spend, recommended actions, and savings.
Output constraints:
- Mention monthly + annual savings.
- Mention at least one concrete recommendation.
- If savings are low, say spend is already efficient.
- Never mention confidential data.
- No bullet points.
```

## Why this prompt
- Forces concise output suitable for a hero section.
- Explicitly includes numerical and recommendation constraints for trust.
- Includes low-savings behavior to avoid fabricated optimization claims.
- Includes privacy guardrail for public report contexts.

## What didn’t work
- A longer, “consultant memo” style prompt generated 200–300 word outputs that buried the key savings number.
- A highly generic “summarize this report” prompt often omitted annual savings and gave fluffy language.
