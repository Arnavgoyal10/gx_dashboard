// Generates draft-level records for a cluster-randomised pilot:
// 40 teams, stratified by regulated industry, half on Publish mode (test) from week 7.

import { BASELINE, DESIGN, SCENARIOS, type ScenarioId } from './scenarios';
import { binomial, clamp, lerp, makeRng, normal, pick, poisson, type Rng } from '../lib/random';

export type Group = 'test' | 'control';
export type Channel = 'email' | 'social';
export type EditType = keyof typeof BASELINE.editMix;
export const EDIT_TYPES: EditType[] = ['tone', 'facts', 'structure', 'length', 'cta'];

export interface Team {
  id: string;
  group: Group;
  regulated: boolean;
  users: number;
  hasBrandKit: boolean; // only test teams can have one
  lightNoise: number; // teams differ; this is what makes team-level stats necessary
}

export interface Draft {
  teamId: string;
  group: Group;
  week: number;
  channel: Channel;
  onPublishMode: boolean;
  regenerations: number;
  kept: boolean;
  sent: boolean;
  reviewMinutes: number | null;
  wordsChangedShare: number | null; // final version vs AI draft, only for sent drafts
  lightEdit: boolean;
  mainEdit: EditType | null;
  approvedFirstTime: boolean | null;
  trustRating: number | null;
  errorFound: boolean;
  sends: number;
  opens: number;
  clicks: number;
  flagsShown: number;
  flagsDismissed: number;
}

export interface ExploreWeek {
  teamId: string;
  group: Group;
  week: number;
  sessionsPerUser: number;
}

export interface Simulation {
  scenario: ScenarioId;
  teams: Team[];
  drafts: Draft[];
  explore: ExploreWeek[];
  weeks: number[];
}

function buildTeams(rng: Rng, kitSetup: number): Team[] {
  const raw = Array.from({ length: DESIGN.teams }, (_, i) => ({
    id: `T${String(i + 1).padStart(2, '0')}`,
    regulated: rng() < DESIGN.regulatedShare,
    users: 5 + Math.floor(rng() * 26),
    lightNoise: normal(rng, 0, 0.025),
  }));
  // Stratified assignment: alternate test/control inside each stratum, in random order.
  // The counter runs across both strata, so the split stays exactly 50/50 overall.
  const teams: Team[] = [];
  let k = 0;
  for (const regulated of [true, false]) {
    const stratum = raw.filter((t) => t.regulated === regulated).sort(() => rng() - 0.5);
    stratum.forEach((t) => {
      const group: Group = k % 2 === 0 ? 'test' : 'control';
      k += 1;
      teams.push({ ...t, group, hasBrandKit: false });
    });
  }
  // Brand Kit setup happens only in test teams; the share depends on the scenario.
  teams
    .filter((t) => t.group === 'test')
    .forEach((t) => {
      t.hasBrandKit = rng() < kitSetup;
    });
  return teams.sort((a, b) => a.id.localeCompare(b.id));
}

export function simulate(scenarioId: ScenarioId): Simulation {
  const sc = SCENARIOS[scenarioId];
  const teamRng = makeRng(20261103); // same teams in every scenario
  const teams = buildTeams(teamRng, sc.kitSetup);
  const rng = makeRng(
    { works: 11, flat: 23, breach: 37 }[scenarioId] * 7919,
  );
  const weeks = [...DESIGN.baselineWeeks, ...DESIGN.testWeeks];
  const drafts: Draft[] = [];
  const explore: ExploreWeek[] = [];

  for (const team of teams) {
    for (const week of weeks) {
      const onPublishMode = team.group === 'test' && week >= DESIGN.testWeeks[0];
      const ramp = onPublishMode ? Math.min(1, (week - DESIGN.testWeeks[0] + 1) / DESIGN.rampWeeks) : 0;
      const t = (base: number, test: number) => (onPublishMode ? lerp(base, test, ramp) : base);

      explore.push({
        teamId: team.id,
        group: team.group,
        week,
        sessionsPerUser: Math.max(0, normal(rng, t(BASELINE.exploreSessions, sc.exploreSessions), 0.22)),
      });

      const n = poisson(rng, team.users * 2.2);
      for (let k = 0; k < n; k += 1) {
        const channel: Channel = rng() < DESIGN.emailShare ? 'email' : 'social';
        const uplift = onPublishMode
          ? ramp * (team.hasBrandKit ? sc.lightUpliftWithKit : sc.lightUpliftNoKit)
          : 0;
        const pLight = clamp(
          BASELINE.lightEditRate +
            team.lightNoise +
            uplift +
            (channel === 'social' ? BASELINE.socialLightBonus : 0),
          0.02,
          0.95,
        );

        const regenerations = poisson(rng, t(BASELINE.regenerations, sc.regenerations));
        const kept = rng() < t(BASELINE.keepRate, sc.keepRate);
        const sent = kept && rng() < BASELINE.sendRate;
        const lightEdit = sent && rng() < pLight;
        const wordsChangedShare = sent
          ? lightEdit
            ? 0.02 + rng() * 0.23
            : 0.26 + ((rng() + rng()) / 2) * 0.62
          : null;
        const editMix = onPublishMode ? sc.editMix : BASELINE.editMix;
        const mainEdit = sent ? pick(rng, EDIT_TYPES, EDIT_TYPES.map((e) => editMix[e])) : null;
        const reviewMinutes = kept
          ? Math.exp(normal(rng, Math.log(t(BASELINE.reviewMinutes, sc.reviewMinutes)), 0.45))
          : null;
        const approvedFirstTime = sent ? rng() < t(BASELINE.firstTimeApproval, sc.firstTimeApproval) : null;
        const ratingMean = onPublishMode
          ? sc.trustStart + sc.trustSlopePerWeek * (week - DESIGN.testWeeks[0])
          : BASELINE.trustRating;
        const trustRating =
          sent && rng() < BASELINE.ratingResponseRate
            ? clamp(Math.round(normal(rng, ratingMean, 0.85)), 1, 5)
            : null;
        const errorFound = sent && rng() < t(BASELINE.errorRate, sc.errorRate);

        let sends = 0;
        let opens = 0;
        let clicks = 0;
        if (sent && channel === 'email') {
          sends = Math.round(1500 + rng() * 8500);
          const openRate = clamp(normal(rng, t(BASELINE.openRate, sc.openRate), 0.025), 0.05, 0.6);
          opens = Math.round(sends * openRate);
          clicks = Math.round(opens * clamp(normal(rng, BASELINE.clickToOpen, 0.02), 0.02, 0.4));
        }

        const flagsShown = onPublishMode && kept ? 1 + poisson(rng, 2.2) : 0;
        const flagsDismissed = flagsShown ? binomial(rng, flagsShown, sc.flagDismissRate) : 0;

        drafts.push({
          teamId: team.id,
          group: team.group,
          week,
          channel,
          onPublishMode,
          regenerations,
          kept,
          sent,
          reviewMinutes,
          wordsChangedShare,
          lightEdit,
          mainEdit,
          approvedFirstTime,
          trustRating,
          errorFound,
          sends,
          opens,
          clicks,
          flagsShown,
          flagsDismissed,
        });
      }
    }
  }
  return { scenario: scenarioId, teams, drafts, explore, weeks };
}
