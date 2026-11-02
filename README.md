# Publish mode pilot: trust & adoption dashboard

A working prototype of the dashboard I would use to run the pilot proposed in my
Galytix Product Analyst case study: an AI writing assistant for marketing teams whose
users like its ideas but rewrite its drafts before sending them.

> **All data in this app is simulated** from the assumptions listed on the *Method* tab.
> Nothing here is a real result. The point is the design: which numbers to watch,
> how each is computed, and how the ship / improve / stop decision is made.

## What it shows

| Tab | What it answers |
|---|---|
| **Overview** | Did it work? Headline metric (share of sent email drafts with ≤25% of words changed), test vs control, team-level 95% interval, and an automatic **Ship / Improve / Stop** verdict from rules agreed before the test. |
| **Funnel & segments** | Where drafts drop out, how much of each draft gets rewritten, what users change (tone, facts, structure…), and where the effect holds or doesn't. |
| **Signals & safeguards** | One early signal per cause (Brand Kit setup, regenerations, time to check, first-time approval, trust rating) and four safeguards (errors after sending, opens/clicks, brainstorming use, flag noise). |
| **Tracking plan & SQL** | The events the product must log from Sprint 1 and the PostgreSQL behind every number. |
| **Method** | Test design, simulation inputs for each scenario, and limitations. |

Use the **scenario switch** to see the decision change: *the fixes work* → Ship,
*signals rise but the headline is flat* → Improve, *a safeguard is breached* → Stop.

## How the numbers are produced

- 40 teams, randomised **by team** (teammates share a Brand Kit and an approver),
  stratified by regulated industry, 20 test / 20 control.
- Two weeks before launch measure today's level; weeks 7–12 compare test vs control.
- `src/data/simulate.ts` generates draft-level records with a seeded random generator,
  so every load shows the same numbers.
- `src/lib/metrics.ts` computes every figure from those records, the same way the SQL
  in `src/content/sql.ts` would from real events. The headline difference uses a
  Welch's t interval on **team-level** averages, not pooled drafts.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## Deploy

Import the repository in Vercel (framework preset: **Vite**; build `npm run build`;
output `dist`). No environment variables are needed.

---
Built by Arnav Goyal. Stack: React, TypeScript, Vite, Recharts.
