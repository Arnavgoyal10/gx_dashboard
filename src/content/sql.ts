// Tracking plan and SQL behind every number on the dashboard (PostgreSQL dialect).

export interface TrackedEvent {
  name: string;
  when: string;
  properties: string;
  feeds: string;
}

export const EVENTS: TrackedEvent[] = [
  { name: 'team_assigned', when: 'Once, when the pilot starts', properties: 'team_id, experiment_group (test | control), stratum (regulated | other)', feeds: 'Every comparison' },
  { name: 'brand_kit_setup_completed', when: 'Team saves its Brand Kit', properties: 'team_id, has_guide, n_example_emails, n_facts', feeds: 'Signal 1' },
  { name: 'draft_generated', when: 'AI returns a draft', properties: 'draft_id, team_id, user_id, mode (explore | publish), channel, brief_filled', feeds: 'Funnel, signals 2–3' },
  { name: 'draft_regenerated', when: 'User asks for a new version', properties: 'draft_id, attempt_no', feeds: 'Signal 2' },
  { name: 'flag_shown / flag_dismissed / line_fixed', when: 'Review mode marks or the user acts on a flag', properties: 'draft_id, flag_id, flag_type (no_source | brand_rule | channel), reason', feeds: 'Safeguard 4' },
  { name: 'draft_exported', when: 'Copy, ‘Export to Google Docs’ or send to email tool', properties: 'draft_id, destination, ai_text_hash', feeds: 'Funnel, signal 3' },
  { name: 'approval_decided', when: 'Approver clicks approve or request changes', properties: 'draft_id, approver_id, decision, round', feeds: 'Signal 4' },
  { name: 'final_version_captured', when: 'Final text read from Review mode, the Docs export (with consent) or the email tool', properties: 'draft_id, source, words_changed_share', feeds: 'Headline metric' },
  { name: 'trust_rating_submitted', when: 'One-question pop-up after export', properties: 'draft_id, rating (1–5)', feeds: 'Signal 5' },
  { name: 'email_results_received', when: 'Daily sync or weekly CSV from the email tool', properties: 'draft_id, sends, opens, clicks', feeds: 'Safeguard 2, weekly report' },
  { name: 'error_reported', when: 'A user or approver flags a mistake in sent copy', properties: 'draft_id, error_type (wrong fact | off-brand | compliance)', feeds: 'Safeguard 1' },
  { name: 'explore_session_started', when: 'User opens Explore (brainstorming)', properties: 'user_id, team_id', feeds: 'Safeguard 3' },
];

export interface Query {
  title: string;
  why: string;
  sql: string;
}

export const QUERIES: Query[] = [
  {
    title: 'Headline: share of sent email drafts with light edits, by group and week',
    why: 'The one number that tells us if Publish mode worked. Light edit = 25% or fewer of the words changed.',
    sql: `SELECT a.experiment_group,
       DATE_TRUNC('week', d.generated_at)                        AS week,
       COUNT(*)                                                    AS sent_email_drafts,
       AVG(CASE WHEN f.words_changed_share <= 0.25 THEN 1.0 ELSE 0 END) AS light_edit_rate
FROM   drafts d
JOIN   team_assignments a USING (team_id)
JOIN   final_versions   f USING (draft_id)
WHERE  d.channel = 'email'
  AND  d.generated_at >= a.assigned_at
GROUP  BY 1, 2
ORDER  BY 2, 1;`,
  },
  {
    title: 'Headline at team level (input to the confidence interval)',
    why: 'Teams were randomised, not drafts, so the test compares team averages. Pooling drafts would overstate certainty.',
    sql: `SELECT d.team_id,
       a.experiment_group,
       AVG(CASE WHEN f.words_changed_share <= 0.25 THEN 1.0 ELSE 0 END) AS team_light_edit_rate,
       COUNT(*) AS n_drafts
FROM   drafts d
JOIN   team_assignments a USING (team_id)
JOIN   final_versions   f USING (draft_id)
WHERE  d.channel = 'email'
  AND  d.generated_at BETWEEN a.assigned_at AND a.assigned_at + INTERVAL '6 weeks'
GROUP  BY 1, 2;`,
  },
  {
    title: 'Signal 2: regenerate clicks per kept draft',
    why: 'If quality is a lottery, users re-roll. Fewer re-rolls means drafts are reliably usable.',
    sql: `SELECT a.experiment_group,
       AVG(COALESCE(r.n_regens, 0)) AS regenerations_per_kept_draft
FROM   drafts d
JOIN   team_assignments a USING (team_id)
LEFT   JOIN (SELECT draft_id, COUNT(*) AS n_regens
             FROM   events WHERE event_name = 'draft_regenerated'
             GROUP  BY 1) r USING (draft_id)
WHERE  d.kept
GROUP  BY 1;`,
  },
  {
    title: 'Signal 3: minutes from draft shown to copied out (median)',
    why: 'The cost of checking. Review mode should make this fall sharply.',
    sql: `SELECT a.experiment_group,
       PERCENTILE_CONT(0.5) WITHIN GROUP (
         ORDER BY EXTRACT(EPOCH FROM (x.exported_at - d.generated_at)) / 60
       ) AS median_minutes_to_export
FROM   drafts d
JOIN   team_assignments a USING (team_id)
JOIN   (SELECT draft_id, MIN(ts) AS exported_at
        FROM   events WHERE event_name = 'draft_exported'
        GROUP  BY 1) x USING (draft_id)
GROUP  BY 1;`,
  },
  {
    title: 'Signal 4: drafts approved first time',
    why: 'If approvers can see sources and checks, fewer drafts bounce back.',
    sql: `SELECT a.experiment_group,
       AVG(CASE WHEN ad.decision = 'approved' THEN 1.0 ELSE 0 END) AS first_time_approval_rate
FROM   approval_decisions ad
JOIN   drafts d USING (draft_id)
JOIN   team_assignments a USING (team_id)
WHERE  ad.round = 1
GROUP  BY 1;`,
  },
  {
    title: 'Signal 5: trust rating by week since launch',
    why: 'Trust should build with evidence, so the test group’s rating should rise week on week.',
    sql: `SELECT a.experiment_group,
       FLOOR(EXTRACT(EPOCH FROM (t.ts - a.assigned_at)) / 604800) + 1 AS week_since_launch,
       AVG(t.rating)  AS avg_trust_rating,
       COUNT(*)       AS responses
FROM   trust_ratings t
JOIN   drafts d USING (draft_id)
JOIN   team_assignments a USING (team_id)
GROUP  BY 1, 2
ORDER  BY 2, 1;`,
  },
  {
    title: 'Safeguards: errors, results, brainstorming, flag noise',
    why: 'More trust is only good if accuracy, results and brainstorming hold, and flags stay useful.',
    sql: `WITH sent AS (
  SELECT d.draft_id, a.experiment_group
  FROM   drafts d JOIN team_assignments a USING (team_id)
  WHERE  d.sent
),
errs AS (SELECT DISTINCT draft_id FROM error_reports),        -- one row per draft, no double counting
res  AS (SELECT draft_id, SUM(sends) AS sends, SUM(opens) AS opens, SUM(clicks) AS clicks
         FROM   email_results GROUP BY 1)
SELECT s.experiment_group,
       100.0 * COUNT(e.draft_id) / COUNT(*)             AS errors_per_100_sent,
       SUM(r.opens)::float  / NULLIF(SUM(r.sends), 0)   AS open_rate,
       SUM(r.clicks)::float / NULLIF(SUM(r.sends), 0)   AS click_rate
FROM   sent s
LEFT   JOIN errs e USING (draft_id)
LEFT   JOIN res  r USING (draft_id)
GROUP  BY 1;

-- Flags users dismiss (test group only)
SELECT SUM(CASE WHEN event_name = 'flag_dismissed' THEN 1 ELSE 0 END)::float
     / NULLIF(SUM(CASE WHEN event_name = 'flag_shown' THEN 1 ELSE 0 END), 0) AS dismiss_rate
FROM   events
WHERE  event_name IN ('flag_shown', 'flag_dismissed');`,
  },
  {
    title: 'Funnel: where email drafts drop out',
    why: 'Shows the bottleneck: abandoned, never sent, or sent only after heavy rewriting.',
    sql: `SELECT a.experiment_group,
       COUNT(*)                                                     AS generated,
       COUNT(*) FILTER (WHERE d.kept)                               AS kept,
       COUNT(*) FILTER (WHERE d.sent)                               AS sent,
       COUNT(*) FILTER (WHERE d.sent AND f.words_changed_share <= 0.25) AS sent_light_edit
FROM   drafts d
JOIN   team_assignments a USING (team_id)
LEFT   JOIN final_versions f USING (draft_id)
WHERE  d.channel = 'email'
GROUP  BY 1;`,
  },
];

export const TABLES = [
  { name: 'events', cols: 'event_name, ts, draft_id, team_id, user_id, properties (jsonb)' },
  { name: 'drafts', cols: 'draft_id, team_id, user_id, mode, channel, generated_at, kept, sent' },
  { name: 'team_assignments', cols: 'team_id, experiment_group, stratum, assigned_at' },
  { name: 'final_versions', cols: 'draft_id, source, words_changed_share, captured_at' },
  { name: 'approval_decisions', cols: 'draft_id, approver_id, decision, round, ts' },
  { name: 'trust_ratings', cols: 'draft_id, rating, ts' },
  { name: 'email_results', cols: 'draft_id, sends, opens, clicks, synced_at' },
  { name: 'error_reports', cols: 'draft_id, error_type, reported_by, ts' },
];
