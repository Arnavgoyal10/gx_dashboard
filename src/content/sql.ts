// Tracking plan and SQL behind the dashboard's headline, signals, safeguards and funnel (PostgreSQL dialect).

export interface TrackedEvent {
  name: string;
  when: string;
  properties: string;
  feeds: string;
}

export const EVENTS: TrackedEvent[] = [
  {
    name: 'team_assigned',
    when: 'Once per team in Sprint 3, when the 40 pilot teams are split',
    properties: 'team_id, experiment_group (test | control), stratum (regulated | other), launch_at (start of week 7)',
    feeds: 'Every comparison',
  },
  { name: 'brand_kit_setup_completed', when: 'A team saves its Brand Kit', properties: 'team_id, has_guide, n_example_emails, n_facts', feeds: 'Signal 1' },
  {
    name: 'draft_generated',
    when: 'The AI returns a draft',
    properties: 'draft_id, team_id, user_id, mode (explore | publish), channel, brief_filled',
    feeds: 'Funnel, signals 2–3',
  },
  { name: 'draft_regenerated', when: 'The user asks for a new version', properties: 'draft_id, attempt_no', feeds: 'Signal 2' },
  {
    name: 'flag_shown / flag_dismissed / line_fixed',
    when: 'Review mode marks a fact or phrase, or the user acts on a flag',
    properties: 'draft_id, flag_id, flag_type (no_source | brand_rule | channel), reason',
    feeds: 'Safeguard 4',
  },
  {
    name: 'draft_exported',
    when: 'Copy, ‘Export to Google Docs’ or send to the email tool',
    properties: 'draft_id, destination, ai_text_hash',
    feeds: 'Funnel, signal 3',
  },
  {
    name: 'approval_decided',
    when: 'Approver approves or asks for changes (approver link in Publish mode; a one-click ‘Approved as is?’ prompt everywhere else)',
    properties: 'draft_id, approver_id, decision, round',
    feeds: 'Signal 4',
  },
  {
    name: 'final_version_captured',
    when: 'Final text read from Review mode, the Google Docs export (with consent) or the email tool',
    properties: 'draft_id, source, words_changed_share, main_edit_type (classified from the changes)',
    feeds: 'Headline, edit types',
  },
  { name: 'trust_rating_submitted', when: 'One-question pop-up after export', properties: 'draft_id, rating (1–5)', feeds: 'Signal 5' },
  {
    name: 'email_results_received',
    when: 'Daily sync or weekly CSV from the email tool',
    properties: 'draft_id, sends, opens, clicks',
    feeds: 'Safeguard 2, weekly results report',
  },
  {
    name: 'error_reported',
    when: 'A user or approver flags a mistake in sent copy',
    properties: 'draft_id, error_type (wrong fact | off-brand | compliance)',
    feeds: 'Safeguard 1',
  },
  { name: 'explore_session_started', when: 'A user opens Explore (brainstorming)', properties: 'user_id, team_id', feeds: 'Safeguard 3' },
];

export interface Query {
  title: string;
  why: string;
  sql: string;
}

export const QUERIES: Query[] = [
  {
    title: 'Start here: a view that tags each draft with its group and period',
    why: 'Every other query reads this. Weeks 1–2 set today’s level, weeks 3–6 are build sprints (left out), weeks 7–12 are the test.',
    sql: `CREATE VIEW pilot_drafts AS
SELECT d.*,
       a.experiment_group,
       a.stratum,
       CASE WHEN d.generated_at >= a.launch_at                      THEN 'test weeks'  -- weeks 7–12
            WHEN d.generated_at <  a.launch_at - INTERVAL '4 weeks' THEN 'today'       -- weeks 1–2
       END AS period                                                                    -- NULL = weeks 3–6
FROM   drafts d
JOIN   team_assignments a USING (team_id)
WHERE  d.generated_at >= a.launch_at - INTERVAL '6 weeks'
  AND  d.generated_at <  a.launch_at + INTERVAL '6 weeks';`,
  },
  {
    title: 'Headline: share of sent email drafts with light edits, by group and week',
    why: 'The one number that tells us if Publish mode worked. Light edit = 25% or fewer of the words changed.',
    sql: `SELECT p.experiment_group,
       DATE_TRUNC('week', p.generated_at)                                AS week,
       COUNT(*)                                                          AS sent_email_drafts,
       AVG(CASE WHEN f.words_changed_share <= 0.25 THEN 1.0 ELSE 0 END)  AS light_edit_rate
FROM   pilot_drafts p
JOIN   final_versions f USING (draft_id)
WHERE  p.channel = 'email'
  AND  p.sent
  AND  p.period IS NOT NULL
GROUP  BY 1, 2
ORDER  BY 2, 1;`,
  },
  {
    title: 'Headline at team level (input to the 95% range)',
    why: 'Teams were split, not drafts, so the test compares team averages. Pooling drafts would overstate how sure we are.',
    sql: `SELECT p.team_id,
       p.experiment_group,
       AVG(CASE WHEN f.words_changed_share <= 0.25 THEN 1.0 ELSE 0 END)  AS team_light_edit_rate,
       COUNT(*)                                                          AS sent_email_drafts
FROM   pilot_drafts p
JOIN   final_versions f USING (draft_id)
WHERE  p.channel = 'email'
  AND  p.sent
  AND  p.period = 'test weeks'
GROUP  BY 1, 2;
-- Welch's t interval on team_light_edit_rate, test vs control, gives the 95% range.`,
  },
  {
    title: 'Signal 1: test teams that set up their Brand Kit in launch week',
    why: 'Fix 1 only works if teams actually set it up. Target: 70% or more.',
    sql: `SELECT COUNT(DISTINCT k.team_id)::float / COUNT(DISTINCT a.team_id) AS kit_setup_share
FROM   team_assignments a
LEFT   JOIN events k
       ON  k.team_id    = a.team_id
       AND k.event_name = 'brand_kit_setup_completed'
       AND k.ts         < a.launch_at + INTERVAL '7 days'
WHERE  a.experiment_group = 'test';`,
  },
  {
    title: 'Signal 2: ‘regenerate’ clicks per kept draft',
    why: 'If quality is a lottery, users re-roll. Target: half of today.',
    sql: `SELECT p.experiment_group,
       p.period,
       AVG(COALESCE(r.n_regens, 0)) AS regenerations_per_kept_draft
FROM   pilot_drafts p
LEFT   JOIN (SELECT draft_id, COUNT(*) AS n_regens
             FROM   events
             WHERE  event_name = 'draft_regenerated'
             GROUP  BY 1) r USING (draft_id)
WHERE  p.kept
  AND  p.period IS NOT NULL
GROUP  BY 1, 2;`,
  },
  {
    title: 'Signal 3: minutes from draft shown to copied out (median)',
    why: 'The cost of checking. Target: half of today.',
    sql: `SELECT p.experiment_group,
       p.period,
       PERCENTILE_CONT(0.5) WITHIN GROUP (
         ORDER BY EXTRACT(EPOCH FROM (x.exported_at - p.generated_at)) / 60
       ) AS median_minutes_to_export
FROM   pilot_drafts p
JOIN   (SELECT draft_id, MIN(ts) AS exported_at
        FROM   events
        WHERE  event_name = 'draft_exported'
        GROUP  BY 1) x USING (draft_id)
WHERE  p.period IS NOT NULL
GROUP  BY 1, 2;`,
  },
  {
    title: 'Signal 4: drafts approved first time',
    why: 'If approvers can see sources and checks, fewer drafts bounce back. Target: above control.',
    sql: `SELECT p.experiment_group,
       p.period,
       AVG(CASE WHEN ad.decision = 'approved' THEN 1.0 ELSE 0 END) AS first_time_approval_rate
FROM   approval_decisions ad
JOIN   pilot_drafts p USING (draft_id)
WHERE  ad.round = 1
  AND  p.period IS NOT NULL
GROUP  BY 1, 2;`,
  },
  {
    title: 'Signal 5: trust rating by group and week',
    why: 'Trust should build as drafts prove themselves, so the test group’s rating should rise week on week.',
    sql: `SELECT p.experiment_group,
       DATE_TRUNC('week', t.ts) AS week,
       AVG(t.rating)            AS avg_trust_rating,
       COUNT(*)                 AS responses
FROM   trust_ratings t
JOIN   pilot_drafts p USING (draft_id)
WHERE  p.period IS NOT NULL
GROUP  BY 1, 2
ORDER  BY 2, 1;`,
  },
  {
    title: 'Safeguards 1–2: errors after sending, and email opens and clicks',
    why: 'More trust is only good if accuracy and results hold. Limit: no worse than control.',
    sql: `WITH errs AS (SELECT DISTINCT draft_id FROM error_reports),   -- one row per draft, no double counting
     res  AS (SELECT draft_id, SUM(sends) AS sends, SUM(opens) AS opens, SUM(clicks) AS clicks
              FROM   email_results
              GROUP  BY 1)
SELECT p.experiment_group,
       100.0 * COUNT(e.draft_id) / COUNT(*)            AS errors_per_100_sent,
       SUM(r.opens)::float  / NULLIF(SUM(r.sends), 0)  AS open_rate,
       SUM(r.clicks)::float / NULLIF(SUM(r.sends), 0)  AS click_rate
FROM   pilot_drafts p
LEFT   JOIN errs e USING (draft_id)
LEFT   JOIN res  r USING (draft_id)
WHERE  p.sent
  AND  p.period = 'test weeks'
GROUP  BY 1;`,
  },
  {
    title: 'Safeguards 3–4: brainstorming sessions, and flags users dismiss',
    why: 'Publish mode must not crowd out brainstorming, and flags must stay useful. Limits: no drop vs control; under 30% dismissed.',
    sql: `-- Brainstorming sessions per active user per week, weeks 7–12
WITH user_weeks AS (
  SELECT e.user_id,
         a.experiment_group,
         DATE_TRUNC('week', e.ts) AS week,
         COUNT(*) FILTER (WHERE e.event_name = 'explore_session_started') AS sessions
  FROM   events e
  JOIN   team_assignments a USING (team_id)
  WHERE  e.ts >= a.launch_at
    AND  e.ts <  a.launch_at + INTERVAL '6 weeks'
  GROUP  BY 1, 2, 3                       -- every user active that week, even with 0 sessions
)
SELECT experiment_group, AVG(sessions) AS brainstorming_sessions_per_user_week
FROM   user_weeks
GROUP  BY 1;

-- Share of flags users dismiss (flags exist only in Publish mode)
SELECT SUM(CASE WHEN event_name = 'flag_dismissed' THEN 1 ELSE 0 END)::float
     / NULLIF(SUM(CASE WHEN event_name = 'flag_shown' THEN 1 ELSE 0 END), 0) AS dismiss_rate
FROM   events
WHERE  event_name IN ('flag_shown', 'flag_dismissed');`,
  },
  {
    title: 'Funnel: where email drafts drop out',
    why: 'Shows the bottleneck: abandoned, never sent, or sent only after heavy rewriting.',
    sql: `SELECT p.experiment_group,
       COUNT(*)                                                          AS generated,
       COUNT(*) FILTER (WHERE p.kept)                                    AS kept,
       COUNT(*) FILTER (WHERE p.sent)                                    AS sent,
       COUNT(*) FILTER (WHERE p.sent AND f.words_changed_share <= 0.25)  AS sent_light_edit
FROM   pilot_drafts p
LEFT   JOIN final_versions f USING (draft_id)
WHERE  p.channel = 'email'
  AND  p.period = 'test weeks'
GROUP  BY 1;`,
  },
];

export const TABLES = [
  { name: 'events', cols: 'event_name, ts, draft_id, team_id, user_id, properties (jsonb)' },
  { name: 'drafts', cols: 'draft_id, team_id, user_id, mode, channel, generated_at, kept, sent' },
  { name: 'team_assignments', cols: 'team_id, experiment_group, stratum, launch_at' },
  { name: 'final_versions', cols: 'draft_id, source, words_changed_share, main_edit_type, captured_at' },
  { name: 'approval_decisions', cols: 'draft_id, approver_id, decision, round, ts' },
  { name: 'trust_ratings', cols: 'draft_id, rating, ts' },
  { name: 'email_results', cols: 'draft_id, sends, opens, clicks, synced_at' },
  { name: 'error_reports', cols: 'draft_id, error_type, reported_by, ts' },
];
