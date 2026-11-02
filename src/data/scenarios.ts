// Simulation inputs. Every number here is an assumption chosen to illustrate the
// dashboard; none of them is a real result. They are shown on the Method tab.

export type ScenarioId = 'works' | 'flat' | 'breach';

/** Behaviour of every team before launch, and of control teams throughout. */
export const BASELINE = {
  lightEditRate: 0.15, // share of sent email drafts with <=25% of words changed
  socialLightBonus: 0.05, // short social posts need fewer edits
  regenerations: 3.2, // 'regenerate' clicks before a draft is kept
  reviewMinutes: 22, // median minutes from draft shown to copied out
  keepRate: 0.8, // drafts not abandoned
  sendRate: 0.9, // kept drafts that are sent or posted
  firstTimeApproval: 0.42,
  trustRating: 2.6, // 'How ready to send was this draft?' 1-5
  ratingResponseRate: 0.4,
  errorRate: 0.02, // sent drafts later found to contain an error
  openRate: 0.24,
  clickToOpen: 0.13,
  exploreSessions: 3.1, // brainstorming sessions per user per week
  editMix: { tone: 0.34, facts: 0.27, structure: 0.14, length: 0.15, cta: 0.1 },
} as const;

export interface Scenario {
  id: ScenarioId;
  label: string;
  story: string;
  kitSetup: number; // share of test teams that finish the Brand Kit in week 1
  lightUpliftWithKit: number;
  lightUpliftNoKit: number;
  regenerations: number;
  reviewMinutes: number;
  keepRate: number;
  firstTimeApproval: number;
  trustStart: number;
  trustSlopePerWeek: number;
  errorRate: number;
  openRate: number;
  exploreSessions: number;
  flagDismissRate: number;
  editMix: Record<keyof typeof BASELINE.editMix, number>;
}

const testEditMix = { tone: 0.21, facts: 0.13, structure: 0.25, length: 0.25, cta: 0.16 };

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  works: {
    id: 'works',
    label: 'The fixes work',
    story:
      'Most test teams set up the Brand Kit, drafts need fewer rewrites, and no safeguard moves. The rules say ship.',
    kitSetup: 0.88,
    lightUpliftWithKit: 0.19,
    lightUpliftNoKit: 0.04,
    regenerations: 1.0,
    reviewMinutes: 7,
    keepRate: 0.88,
    firstTimeApproval: 0.6,
    trustStart: 2.8,
    trustSlopePerWeek: 0.17,
    errorRate: 0.018,
    openRate: 0.242,
    exploreSessions: 3.05,
    flagDismissRate: 0.17,
    editMix: testEditMix,
  },
  flat: {
    id: 'flat',
    label: 'Signals rise, headline flat',
    story:
      'Checking gets faster, but fewer than half of test teams finish the Brand Kit, so drafts still get rewritten. The rules say improve setup, then re-test.',
    kitSetup: 0.42,
    lightUpliftWithKit: 0.07,
    lightUpliftNoKit: 0.0,
    regenerations: 1.0,
    reviewMinutes: 7.5,
    keepRate: 0.86,
    firstTimeApproval: 0.55,
    trustStart: 2.7,
    trustSlopePerWeek: 0.09,
    errorRate: 0.019,
    openRate: 0.24,
    exploreSessions: 3.08,
    flagDismissRate: 0.24,
    editMix: { tone: 0.3, facts: 0.22, structure: 0.18, length: 0.18, cta: 0.12 },
  },
  breach: {
    id: 'breach',
    label: 'Safeguard breach',
    story:
      'The headline jumps, but users wave flags through and more wrong claims reach customers. The rules say stop and fix before shipping.',
    kitSetup: 0.82,
    lightUpliftWithKit: 0.22,
    lightUpliftNoKit: 0.06,
    regenerations: 1.0,
    reviewMinutes: 4,
    keepRate: 0.9,
    firstTimeApproval: 0.64,
    trustStart: 3.0,
    trustSlopePerWeek: 0.16,
    errorRate: 0.047,
    openRate: 0.238,
    exploreSessions: 3.02,
    flagDismissRate: 0.43,
    editMix: testEditMix,
  },
};

export const SCENARIO_ORDER: ScenarioId[] = ['works', 'flat', 'breach'];

export const DESIGN = {
  teams: 40,
  regulatedShare: 0.3,
  baselineWeeks: [1, 2],
  testWeeks: [7, 8, 9, 10, 11, 12],
  rampWeeks: 3, // teams take ~3 weeks to settle into Publish mode
  emailShare: 0.55,
  lightEditThreshold: 0.25,
  shipRatio: 1.5,
  kitTarget: 0.7,
  dismissLimit: 0.3,
  errorTolerancePts: 0.5, // percentage points above control before it counts as a breach
  resultTolerance: 0.05, // opens/clicks and brainstorming may sit within 5% of control
} as const;
