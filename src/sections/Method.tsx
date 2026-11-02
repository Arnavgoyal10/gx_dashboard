import { Reveal } from '../components/motion';
import { SectionHead } from '../components/ui';
import { GLOSSARY } from '../content/glossary';
import { BASELINE, DESIGN, SCENARIOS, SCENARIO_ORDER } from '../data/scenarios';
import type { Dashboard } from '../lib/metrics';

const p = (x: number) => `${Math.round(x * 100)}%`;

export default function Method({ d }: { d: Dashboard }) {
  return (
    <section className="sec white" id="method">
      <div className="wrap">
        <SectionHead
          eyebrow="7 · Method"
          title={
            <>
              How the pilot is set up, and what is <em>simulated</em>
            </>
          }
          intro="Everything needed to judge the numbers above: how teams were split, what the simulation assumes, and where it falls short."
        />
        <div className="grid-1-1">
          <Reveal className="card card-grey">
            <h3 className="card-title">Test design</h3>
            <ul className="list">
              <li>
                <b>{DESIGN.teams} marketing teams</b>, split at random into {d.counts.testTeams} test and {DESIGN.teams - d.counts.testTeams} control
                teams. Teams, not people, are split, because teammates share a Brand Kit and an approver.
              </li>
              <li>The split is balanced so regulated-industry teams (finance, health) fall evenly into both groups.</li>
              <li>
                <b>Weeks 1–2</b> (shown as ‘Pre 1–2’): everyone uses today’s tool with tracking on, to set today’s level.{' '}
                <b>Weeks 7–12</b>: test teams use Publish mode; control teams change nothing.
              </li>
              <li>The headline difference is tested on per-team averages (Welch’s t interval), not pooled drafts.</li>
              <li>
                This run produced {d.counts.drafts.toLocaleString()} drafts, {d.counts.sent.toLocaleString()} of them sent.
              </li>
            </ul>
          </Reveal>
          <Reveal className="card card-grey" delay={120}>
            <h3 className="card-title">Limits of this prototype</h3>
            <ul className="list">
              <li>
                <b>The data is simulated.</b> Real results will be noisier, and novelty can inflate early weeks, which is why the test runs 6 weeks.
              </li>
              <li>
                Final text is only visible when users edit in Review mode, export to Google Docs with consent, or send through a connected email tool.
                Drafts copied anywhere else are left out of the headline and reported separately.
              </li>
              <li>Segments hold only a few teams each, so they raise questions rather than answer them.</li>
            </ul>
          </Reveal>
        </div>

        <Reveal className="card card-grey">
          <h3 className="card-title">Simulation inputs: assumptions, not findings</h3>
          <p className="card-text">
            Before launch, every team behaves the same: {p(BASELINE.lightEditRate)} of sent email drafts lightly edited,{' '}
            {BASELINE.regenerations} regenerations per kept draft, {BASELINE.reviewMinutes} minutes median to check a draft,{' '}
            {p(BASELINE.firstTimeApproval)} approved first time and {p(BASELINE.errorRate)} of sent drafts later found to contain an error. Each
            scenario then changes these for Publish mode teams:
          </p>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Teams that set up a Brand Kit</th>
                  <th>Extra light-edit rate (with / without kit)</th>
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
                      <td>
                        <b>{s.label}</b>
                      </td>
                      <td>{p(s.kitSetup)}</td>
                      <td>
                        +{p(s.lightUpliftWithKit)} / +{p(s.lightUpliftNoKit)}
                      </td>
                      <td>{s.regenerations}</td>
                      <td>{s.reviewMinutes}</td>
                      <td>{(s.errorRate * 100).toFixed(1)}%</td>
                      <td>{p(s.flagDismissRate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal className="card card-grey" >
          <h3 className="card-title">Glossary</h3>
          <dl className="glossary">
            {Object.entries(GLOSSARY).map(([k, v]) => (
              <div key={k}>
                <dt>{k.charAt(0).toUpperCase() + k.slice(1)}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
