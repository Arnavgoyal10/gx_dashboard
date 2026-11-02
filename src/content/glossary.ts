// Plain-language definitions shown when a reader hovers or taps a dotted term.

export const GLOSSARY: Record<string, string> = {
  'Publish mode':
    'The new part of the tool. When a user picks an idea to actually send, Publish mode writes the draft from the team’s Brand Kit and opens it in Review mode.',
  'Explore mode': 'Today’s brainstorming tool, left unchanged. Users generate ideas freely here.',
  'Brand Kit':
    'Fix 1. A one-time, ~10-minute setup where a team saves its brand guide, 3–10 of its best past emails, a fact sheet (products, prices, current offers with end dates, banned phrases) and its customer groups. Together with a short brief, drafts are written from it.',
  'Review mode':
    'Fix 2. A checking view that marks each fact and phrase in a draft: green if it matches the team’s sources, amber if no source was found, red if it breaks a brand rule.',
  'light edit':
    'A sent draft where 25% or fewer of the words changed from what the AI wrote. A normal review pass changes a few sentences, not a quarter of the text.',
  'test group': 'The 20 teams that got Publish mode during the pilot.',
  'control group': 'The 20 teams that kept today’s tool. Comparing against them shows what changed because of Publish mode, not because of the season or the team.',
  'A/B test':
    'A fair comparison: teams are split at random into a test group (new feature) and a control group (no change), and the two are compared over the same weeks.',
  'today’s level': 'What every team did in weeks 1–2 (Sprint 1), before anything changed, measured with the new tracking. Targets are set against it.',
  'confidence interval':
    'The range the true difference most likely falls in, with 95% confidence. If the whole range is above zero, the gain is unlikely to be luck.',
  'team-level':
    'Teams, not individual drafts, were split into groups, so results are averaged per team first. Treating every draft as independent would overstate how sure we are.',
  'ramp-up': 'Teams take about three weeks to settle into a new way of working, so early weeks understate the steady effect.',
  'early signal': 'A metric tied to one of the five likely causes of distrust. It shows whether each fix did its own job, even before the headline moves.',
  safeguard: 'Something that must not get worse while trust goes up, such as errors reaching customers. Any breach stops the rollout.',
  regenerate: 'Asking the AI for a fresh version of a draft. Many regenerations mean quality feels like a lottery.',
  'first-time approval': 'The approver signs off the draft without asking for changes. Logged at sign-off: through the approver link in Publish mode, or a one-click ‘Approved as is?’ prompt everywhere else.',
  'trust rating': 'A one-question pop-up after export: ‘How ready to send was this draft?’ from 1 (rewrote it) to 5 (sent as is).',
  flag: 'A mark Review mode puts on a fact or phrase that has no source or breaks a brand rule.',
  'dismiss rate': 'The share of flags users close without acting on them. If it gets too high, flags have become noise and real problems slip through.',
  funnel: 'The steps a draft goes through, from generated to sent. The biggest drop between steps is the bottleneck.',
  segment: 'A slice of teams, such as regulated industries or larger teams, used to see where the effect is strongest.',
};
