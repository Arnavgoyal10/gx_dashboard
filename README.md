# Publish mode pilot: trust & adoption dashboard

A working prototype of the dashboard I would use to run the pilot proposed in my
Galytix Product Analyst case study: an AI writing assistant for marketing teams whose
users like its ideas but rewrite its drafts before sending them.

> **All data in this app is simulated** from the assumptions listed in the *Method*
> section, except one survey statistic labelled *Real survey data* (Optimizely/Savanta,
> June 2026). The point is the design: which numbers to watch, how each is computed,
> and how the ship / improve / stop decision is made.

## How the page is laid out

One scrolling page, styled after galytix.com (black and white sections, blue accents,
pill buttons, fade-in on scroll). Each section answers one question:

| # | Section | Question it answers |
|---|---|---|
| – | **Intro** | What is being tested, and how to read the page (3 steps). |
| 1 | **The answer** | Did it work? Ship / Improve / Stop from rules agreed before the test, the headline ratio, and how sure we are (team-level 95% interval). |
| 2 | **Headline over time** | Is the share of drafts sent with only light edits (≤25% of words changed) rising for test teams vs control? Plus the 1–5 trust rating by week. |
| 3 | **Early signals** | Did each fix do its job? One signal per cause of distrust, with today’s level, control and target. |
| 4 | **Safeguards** | Did anything get worse? Errors reaching customers, email opens/clicks, brainstorming use, flag noise. |
| 5 | **Deep dive** | Where drafts drop out (funnel), how much gets rewritten, what users change, and which segments it works for. |
| 6 | **How it’s measured** | The events the product must log from Sprint 1, the data model, and the PostgreSQL behind every number (copyable). |
| 7 | **Method** | Test design, limits, simulation inputs per scenario, and a plain-language glossary. |

Use the **Try a scenario** bar at the top to see the decision change:
*the fixes work* → Ship, *signals rise but the headline is flat* → Improve,
*a safeguard is breached* → Stop. Words with a dotted underline explain themselves on
hover or tap.

## How the numbers are produced

- 40 teams, randomised **by team** (teammates share a Brand Kit and an approver),
  stratified by regulated industry, 20 test / 20 control.
- The two weeks before launch set today's level; weeks 7–12 compare test vs control
  after a three-week ramp-up.
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
output `dist`). No environment variables are needed. Fonts are self-hosted via
`@fontsource`, so the site makes no third-party requests.

---
Built by Arnav Goyal. Stack: React, TypeScript, Vite, Recharts.
