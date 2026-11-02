// Every number on the dashboard is computed here from draft-level records,
// the same way the SQL on the 'Tracking plan & SQL' tab would compute it.

import { DESIGN } from '../data/scenarios';
import { EDIT_TYPES, type Draft, type EditType, type Group, type Simulation } from '../data/simulate';
import { mean, slope, welch, type Comparison } from './stats';

const isTestWeek = (w: number) => (DESIGN.testWeeks as readonly number[]).includes(w);
const isBaseWeek = (w: number) => (DESIGN.baselineWeeks as readonly number[]).includes(w);

const share = (xs: boolean[]) => (xs.length ? xs.filter(Boolean).length / xs.length : NaN);
function median(xs: number[]): number {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const sentEmail = (d: Draft) => d.sent && d.channel === 'email';
const lightRate = (ds: Draft[]) => share(ds.filter(sentEmail).map((d) => d.lightEdit));

export const weekLabel = (w: number) => (isBaseWeek(w) ? `Pre ${w}` : `Wk ${w}`);

export interface WeeklyPoint {
  week: number;
  label: string;
  test: number;
  control: number;
  shipBar: number | null;
}

export interface Signal {
  key: string;
  cause: string;
  name: string;
  how: string;
  today: string;
  test: string;
  control: string;
  target: string;
  met: boolean;
}

export interface Safeguard {
  key: string;
  name: string;
  how: string;
  test: string;
  control: string;
  limit: string;
  breached: boolean;
}

export type Verdict = 'ship' | 'improve' | 'stop' | 'keep-testing';

export interface Dashboard {
  today: number;
  headline: { test: number; control: number; ratio: number; ci: Comparison; teamRates: Record<Group, number[]> };
  weekly: WeeklyPoint[];
  trustWeekly: { label: string; test: number; control: number }[];
  signals: Signal[];
  safeguards: Safeguard[];
  verdict: Verdict;
  reasons: string[];
  funnel: { stage: string; test: number; control: number; testN: number; controlN: number }[];
  bottleneck: string;
  segments: { name: string; test: number; control: number; ratio: number; teams: string }[];
  editMix: { type: string; before: number; test: number }[];
  histogram: { bin: string; test: number; control: number }[];
  counts: { drafts: number; sent: number; teams: number; testTeams: number; kitTeams: number };
}

const pct = (x: number, dp = 0) => `${(x * 100).toFixed(dp)}%`;
const num = (x: number, dp = 1) => x.toFixed(dp);

const EDIT_LABEL: Record<EditType, string> = {
  tone: 'Tone / brand voice',
  facts: 'Facts / claims',
  structure: 'Structure',
  length: 'Length',
  cta: 'Call to action',
};

export function computeDashboard(sim: Simulation): Dashboard {
  const { drafts, teams, explore } = sim;
  const inTest = drafts.filter((d) => isTestWeek(d.week));
  const before = drafts.filter((d) => isBaseWeek(d.week));
  const by = (g: Group, ds = inTest) => ds.filter((d) => d.group === g);

  // ---------- Headline ----------
  const today = lightRate(before);
  const testRate = lightRate(by('test'));
  const controlRate = lightRate(by('control'));
  const teamRates: Record<Group, number[]> = { test: [], control: [] };
  for (const team of teams) {
    const r = lightRate(inTest.filter((d) => d.teamId === team.id));
    if (!Number.isNaN(r)) teamRates[team.group].push(r);
  }
  const ci = welch(teamRates.test, teamRates.control);
  const ratio = testRate / controlRate;

  const weekly: WeeklyPoint[] = sim.weeks.map((w) => {
    const ds = drafts.filter((d) => d.week === w);
    return {
      week: w,
      label: weekLabel(w),
      test: lightRate(ds.filter((d) => d.group === 'test')),
      control: lightRate(ds.filter((d) => d.group === 'control')),
      shipBar: isTestWeek(w) ? controlRate * DESIGN.shipRatio : null,
    };
  });

  const ratingOf = (ds: Draft[]) => mean(ds.filter((d) => d.trustRating !== null).map((d) => d.trustRating as number));
  const trustWeekly = sim.weeks.map((w) => {
    const ds = drafts.filter((d) => d.week === w);
    return {
      label: weekLabel(w),
      test: ratingOf(ds.filter((d) => d.group === 'test')),
      control: ratingOf(ds.filter((d) => d.group === 'control')),
    };
  });

  // ---------- Early signals (one per cause) ----------
  const testTeams = teams.filter((t) => t.group === 'test');
  const kitShare = testTeams.filter((t) => t.hasBrandKit).length / testTeams.length;

  const regen = (ds: Draft[]) => mean(ds.filter((d) => d.kept).map((d) => d.regenerations));
  const review = (ds: Draft[]) => median(ds.filter((d) => d.reviewMinutes !== null).map((d) => d.reviewMinutes as number));
  const approval = (ds: Draft[]) => share(ds.filter((d) => d.approvedFirstTime !== null).map((d) => d.approvedFirstTime as boolean));

  const approvalTeams = (g: Group) =>
    teams.filter((t) => t.group === g).map((t) => approval(inTest.filter((d) => d.teamId === t.id)));
  const approvalCi = welch(approvalTeams('test'), approvalTeams('control'));

  const testTrust = trustWeekly.filter((p) => isTestWeek(Number(p.label.replace(/\D/g, ''))));
  const trustSlope = slope(
    testTrust.map((_, i) => i),
    testTrust.map((p) => p.test),
  );

  const regenToday = regen(before);
  const reviewToday = review(before);
  const signals: Signal[] = [
    {
      key: 'kit',
      cause: '1 · Doesn’t know the brand',
      name: 'Test teams with Brand Kit set up in week 1',
      how: 'brand_kit_setup_completed events per test team',
      today: 'new',
      test: pct(kitShare),
      control: 'n/a',
      target: `≥ ${pct(DESIGN.kitTarget)}`,
      met: kitShare >= DESIGN.kitTarget,
    },
    {
      key: 'regen',
      cause: '2 · Quality is a lottery',
      name: '‘Regenerate’ clicks per draft kept',
      how: 'draft_regenerated per kept draft',
      today: num(regenToday),
      test: num(regen(by('test'))),
      control: num(regen(by('control'))),
      target: `≤ ${num(regenToday / 2)} (half of today)`,
      met: regen(by('test')) <= regenToday / 2,
    },
    {
      key: 'review',
      cause: '3 · Checking is costly',
      name: 'Minutes from draft shown to copied out (median)',
      how: 'draft_exported.ts − draft_generated.ts',
      today: num(reviewToday, 0),
      test: num(review(by('test')), 0),
      control: num(review(by('control')), 0),
      target: `≤ ${num(reviewToday / 2, 0)} (half of today)`,
      met: review(by('test')) <= reviewToday / 2,
    },
    {
      key: 'approval',
      cause: '4 · Writer takes the blame',
      name: 'Drafts approved first time',
      how: 'approval_decided where round = 1',
      today: pct(approval(before)),
      test: pct(approval(by('test'))),
      control: pct(approval(by('control'))),
      target: 'Above control (95% CI > 0)',
      met: approvalCi.low > 0,
    },
    {
      key: 'trust',
      cause: '5 · No track record',
      name: 'Trust rating, 1–5 (‘How ready was this to send?’)',
      how: 'trust_rating_submitted after export',
      today: num(ratingOf(before)),
      test: `${num(testTrust[testTrust.length - 1].test)} in final week`,
      control: num(ratingOf(by('control'))),
      target: 'Rises week on week',
      met: trustSlope > 0.05,
    },
  ];

  // ---------- Safeguards ----------
  const errRate = (ds: Draft[]) => share(ds.filter((d) => d.sent).map((d) => d.errorFound));
  const openRate = (ds: Draft[]) => {
    const e = ds.filter(sentEmail);
    return e.reduce((s, d) => s + d.opens, 0) / e.reduce((s, d) => s + d.sends, 0);
  };
  const clickRate = (ds: Draft[]) => {
    const e = ds.filter(sentEmail);
    return e.reduce((s, d) => s + d.clicks, 0) / e.reduce((s, d) => s + d.sends, 0);
  };
  const exploreRate = (g: Group) =>
    mean(explore.filter((e) => e.group === g && isTestWeek(e.week)).map((e) => e.sessionsPerUser));
  const flags = by('test').reduce(
    (acc, d) => ({ shown: acc.shown + d.flagsShown, dismissed: acc.dismissed + d.flagsDismissed }),
    { shown: 0, dismissed: 0 },
  );
  const dismissRate = flags.dismissed / flags.shown;

  const errT = errRate(by('test'));
  const errC = errRate(by('control'));
  const openT = openRate(by('test'));
  const openC = openRate(by('control'));
  const clickT = clickRate(by('test'));
  const clickC = clickRate(by('control'));
  const expT = exploreRate('test');
  const expC = exploreRate('control');

  const safeguards: Safeguard[] = [
    {
      key: 'errors',
      name: 'Errors found after sending (per 100 sent)',
      how: 'error_reported events / sent drafts',
      test: num(errT * 100),
      control: num(errC * 100),
      limit: `No more than ${DESIGN.errorTolerancePts} above control`,
      breached: (errT - errC) * 100 > DESIGN.errorTolerancePts,
    },
    {
      key: 'results',
      name: 'Email open rate · click rate',
      how: 'email_results_received (email tool)',
      test: `${pct(openT, 1)} · ${pct(clickT, 1)}`,
      control: `${pct(openC, 1)} · ${pct(clickC, 1)}`,
      limit: 'Within 5% of control',
      breached: openT < openC * (1 - DESIGN.resultTolerance) || clickT < clickC * (1 - DESIGN.resultTolerance),
    },
    {
      key: 'explore',
      name: 'Brainstorming sessions per user per week',
      how: 'explore_session_started per active user',
      test: num(expT, 2),
      control: num(expC, 2),
      limit: 'Within 5% of control',
      breached: expT < expC * (1 - DESIGN.resultTolerance),
    },
    {
      key: 'dismiss',
      name: 'Flags users dismiss',
      how: 'flag_dismissed / flag_shown',
      test: pct(dismissRate),
      control: 'n/a',
      limit: `Under ${pct(DESIGN.dismissLimit)}`,
      breached: dismissRate >= DESIGN.dismissLimit,
    },
  ];

  // ---------- Decision ----------
  const breaches = safeguards.filter((s) => s.breached);
  const met = signals.filter((s) => s.met).length;
  let verdict: Verdict;
  const reasons: string[] = [];
  if (breaches.length) {
    verdict = 'stop';
    breaches.forEach((b) => reasons.push(`Safeguard breached: ${b.name.toLowerCase()} (test ${b.test} vs limit: ${b.limit.toLowerCase()}).`));
    reasons.push('A safeguard breach overrides any gain in the headline metric.');
  } else if (ratio >= DESIGN.shipRatio && ci.low > 0) {
    verdict = 'ship';
    reasons.push(`Headline is ${num(ratio, 2)}× control (bar: ${DESIGN.shipRatio}×), and the 95% interval on the difference is above zero.`);
    reasons.push(`All four safeguards hold. ${met} of 5 early signals hit target.`);
  } else if (met >= 3) {
    verdict = 'improve';
    reasons.push(
      ratio >= DESIGN.shipRatio
        ? `Headline is ${num(ratio, 2)}× control, but the 95% interval on the difference includes zero, so the gain is not reliable yet. ${met} of 5 early signals hit target.`
        : `Headline is only ${num(ratio, 2)}× control (bar: ${DESIGN.shipRatio}×), but ${met} of 5 early signals hit target.`,
    );
    const missed = signals.filter((s) => !s.met).map((s) => s.cause.split('· ')[1].toLowerCase());
    if (missed.length) reasons.push(`Signals that missed point to where to fix next: ${missed.join('; ')}.`);
  } else {
    verdict = 'keep-testing';
    reasons.push('Neither the headline nor most early signals moved. Revisit the causes before building more.');
  }

  // ---------- Funnel (email drafts, test weeks) ----------
  const funnelFor = (g: Group) => {
    const ds = by(g).filter((d) => d.channel === 'email');
    return [ds.length, ds.filter((d) => d.kept).length, ds.filter((d) => d.sent).length, ds.filter((d) => d.sent && d.lightEdit).length];
  };
  const ft = funnelFor('test');
  const fc = funnelFor('control');
  const stages = ['Drafts generated', 'Kept (not abandoned)', 'Sent', 'Sent with light edits'];
  const funnel = stages.map((stage, i) => ({
    stage,
    test: ft[i] / ft[0],
    control: fc[i] / fc[0],
    testN: ft[i],
    controlN: fc[i],
  }));
  const drops = stages.slice(1).map((s, i) => ({ s, drop: 1 - ft[i + 1] / ft[i] }));
  const bottleneck = drops.sort((a, b) => b.drop - a.drop)[0].s;

  // ---------- Segments ----------
  const teamById = new Map(teams.map((t) => [t.id, t]));
  const seg = (name: string, keep: (d: Draft) => boolean, channel: 'email' | 'social' = 'email') => {
    const ds = inTest.filter((d) => keep(d));
    const rate = (g: Group) => share(ds.filter((d) => d.group === g && d.sent && d.channel === channel).map((d) => d.lightEdit));
    const tt = new Set(ds.filter((d) => d.group === 'test').map((d) => d.teamId)).size;
    const tc = new Set(ds.filter((d) => d.group === 'control').map((d) => d.teamId)).size;
    return { name, test: rate('test'), control: rate('control'), ratio: rate('test') / rate('control'), teams: `${tt} vs ${tc}` };
  };
  const segments = [
    seg('All email drafts', () => true),
    seg('Regulated industries', (d) => teamById.get(d.teamId)!.regulated),
    seg('Other industries', (d) => !teamById.get(d.teamId)!.regulated),
    seg('Smaller teams (5–15 users)', (d) => teamById.get(d.teamId)!.users <= 15),
    seg('Larger teams (16–30 users)', (d) => teamById.get(d.teamId)!.users > 15),
    seg('Test teams with Brand Kit vs control', (d) => d.group === 'control' || teamById.get(d.teamId)!.hasBrandKit),
    seg('Test teams without Brand Kit vs control', (d) => d.group === 'control' || !teamById.get(d.teamId)!.hasBrandKit),
    seg('Social posts (secondary)', () => true, 'social'),
  ];

  // ---------- What users change ----------
  const mix = (ds: Draft[]) => {
    const edits = ds.filter((d) => d.sent && !d.lightEdit && d.mainEdit);
    return Object.fromEntries(EDIT_TYPES.map((e) => [e, edits.filter((d) => d.mainEdit === e).length / edits.length]));
  };
  const mixBefore = mix(before);
  const mixTest = mix(by('test'));
  const editMix = EDIT_TYPES.map((e) => ({ type: EDIT_LABEL[e], before: mixBefore[e], test: mixTest[e] }));

  // ---------- Edit-share distribution ----------
  const bins = Array.from({ length: 10 }, (_, i) => i / 10);
  const distro = (g: Group) => {
    const xs = by(g).filter(sentEmail).map((d) => d.wordsChangedShare as number);
    return bins.map((b) => xs.filter((x) => x >= b && x < b + 0.1).length / xs.length);
  };
  const dt = distro('test');
  const dc = distro('control');
  const histogram = bins.map((b, i) => ({ bin: `${b * 100}–${b * 100 + 10}%`, test: dt[i], control: dc[i] }));

  return {
    today,
    headline: { test: testRate, control: controlRate, ratio, ci, teamRates },
    weekly,
    trustWeekly,
    signals,
    safeguards,
    verdict,
    reasons,
    funnel,
    bottleneck,
    segments,
    editMix,
    histogram,
    counts: {
      drafts: drafts.length,
      sent: drafts.filter((d) => d.sent).length,
      teams: teams.length,
      testTeams: testTeams.length,
      kitTeams: testTeams.filter((t) => t.hasBrandKit).length,
    },
  };
}

export const fmt = { pct, num };
