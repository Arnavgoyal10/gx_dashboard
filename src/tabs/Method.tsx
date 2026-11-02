import { Card } from '../components/ui';
import { BASELINE, DESIGN, SCENARIOS, SCENARIO_ORDER } from '../data/scenarios';
import type { Dashboard } from '../lib/metrics';

const p = (x: number) => `${Math.round(x * 100)}%`;

export default function Method({ d }: { d: Dashboard }) {
  return (
    <>
      <Card title="What this is" subtitle="And what it is not.">
        <ul className="list">
          <li>A working prototype of the dashboard I would use to run the Publish mode pilot proposed in my case study (an AI writing assistant for marketing teams).</li>
          <li><b>All data is simulated</b> from the assumptions below. Nothing here is a real result; the point is the design: which numbers to watch, how they are computed, and how the decision is made.</li>
          <li>Every figure is computed from draft-level records in the browser, the same way the SQL on the previous tab would compute it from real events.</li>
        </ul>
      </Card>
      <Card title="Test design">
        <ul className="list">
          <li><b>{DESIGN.teams} teams</b>, randomised by team (teammates share a Brand Kit and an approver), stratified so regulated-industry teams are split evenly. {d.counts.testTeams} test teams, {DESIGN.teams - d.counts.testTeams} control teams.</li>
          <li><b>Weeks 1–2</b> (shown as ‘Pre 1–2’): everyone on today’s tool, with tracking on, to measure the ‘before’ level. <b>Weeks 7–12</b>: test teams on Publish mode, control teams unchanged.</li>
          <li>The headline difference is tested on <b>team-level averages</b> (Welch’s t interval), not pooled drafts, because teams are the unit of randomisation.</li>
          <li>This simulation produced {d.counts.drafts.toLocaleString()} drafts, {d.counts.sent.toLocaleString()} of them sent.</li>
        </ul>
      </Card>
      <Card title="Simulation inputs (assumptions, not findings)" subtitle={`Before launch, every team behaves like this: ${p(BASELINE.lightEditRate)} of sent email drafts lightly edited, ${BASELINE.regenerations} regenerations per kept draft, ${BASELINE.reviewMinutes} min median to check, ${p(BASELINE.firstTimeApproval)} approved first time, ${p(BASELINE.errorRate)} of sent drafts with an error.`}>
        <table className="table">
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Brand Kit set up</th>
              <th>Light-edit uplift (with / without kit)</th>
              <th>Regenerations</th>
              <th>Minutes to check</th>
              <th>Error rate</th>
              <th>Flags dismissed</th>
            </tr>
          </thead>
          <tbody>
            {SCENARIO_ORDER.map((id) => {
              const s = SCENARIOS[id];
              return (
                <tr key={id}>
                  <td><b>{s.label}</b></td>
                  <td>{p(s.kitSetup)}</td>
                  <td>+{p(s.lightUpliftWithKit)} / +{p(s.lightUpliftNoKit)}</td>
                  <td>{s.regenerations}</td>
                  <td>{s.reviewMinutes}</td>
                  <td>{(s.errorRate * 100).toFixed(1)}%</td>
                  <td>{p(s.flagDismissRate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <Card title="Limits of this prototype">
        <ul className="list">
          <li>Real effects will be noisier, and novelty can inflate early results; that is why the test runs 6 weeks.</li>
          <li>Final text is only visible where users edit in Review mode, export to Google Docs with consent, or send through a connected email tool. Drafts copied elsewhere are excluded from the headline and reported separately.</li>
          <li>Segment cuts use only a few teams each, so they generate questions rather than answers.</li>
        </ul>
      </Card>
    </>
  );
}
