import { CountUp, Reveal } from '../components/motion';
import { SectionHead, Term } from '../components/ui';
import { DESIGN } from '../data/scenarios';
import { fmt, type Dashboard, type Verdict } from '../lib/metrics';

const VERDICT: Record<Verdict, { word: string; tone: string; line: string }> = {
  ship: { word: 'Ship', tone: 'good', line: 'Roll Publish mode out to every email team, then to social posts.' },
  improve: { word: 'Improve, then re-test', tone: 'warn', line: 'Fix what the missed signal points to before rolling out further.' },
  stop: { word: 'Stop and fix', tone: 'bad', line: 'Do not roll out until the breached safeguard is back within its limit.' },
  'keep-testing': { word: 'Stop and rethink', tone: 'bad', line: 'Neither the headline nor the signals moved. Go back to the causes before building more.' },
};

export default function Answer({ d }: { d: Dashboard }) {
  const v = VERDICT[d.verdict];
  const { test, control, ratio, ci } = d.headline;
  const breaches = d.safeguards.filter((s) => s.breached).length;
  const met = d.signals.filter((s) => s.met).length;
  return (
    <section className="sec white" id="answer">
      <div className="wrap">
        <SectionHead
          eyebrow="1 · The answer"
          title={
            <>
              After 6 weeks, the rules say <em className={`tone-${v.tone}`}>{v.word}</em>
            </>
          }
          intro="Ship, improve or stop is decided by three rules written down before the test began, so the result can’t be argued into a yes afterwards."
        />

        <div className="answer-grid">
          <Reveal from="left" className="big-stat">
            <p className="big-num">
              <CountUp key={d.verdict + ratio.toFixed(2)} value={ratio} decimals={2} suffix="×" />
            </p>
            <p className="big-cap">
              the share of email drafts sent with only <Term t="light edit">light edits</Term>: <Term t="test group">Publish mode teams</Term>{' '}
              {fmt.pct(test, 1)}, teams on today’s tool {fmt.pct(control, 1)}.
            </p>
          </Reveal>
          <Reveal from="right" delay={120} className={`decision decision-${v.tone}`}>
            <p className="decision-label">Decision</p>
            <p className="decision-word">{v.word}</p>
            <p className="decision-line">{v.line}</p>
            <ul>
              {d.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="rules">
          {[
            { k: 'good', w: 'Ship', t: `if the headline is at least ${DESIGN.shipRatio}× the control group, the gain is not luck, and every safeguard holds.` },
            { k: 'warn', w: 'Improve', t: 'if 3 or more early signals hit target but the headline doesn’t pass the Ship rule.' },
            { k: 'bad', w: 'Stop', t: 'if any safeguard is breached, whatever the headline says, or if nothing moves.' },
          ].map((r, i) => (
            <Reveal key={r.w} delay={i * 100} className={`rule rule-${r.k} ${v.word.startsWith(r.w) ? 'rule-on' : ''}`}>
              <b>{r.w}</b> {r.t}
            </Reveal>
          ))}
        </div>

        <div className="kpis">
          <Reveal className="kpi">
            <p className="kpi-label">Headline metric</p>
            <p className="kpi-value">
              {fmt.pct(test, 1)} <span>vs {fmt.pct(control, 1)}</span>
            </p>
            <p className="kpi-note">
              Sent email drafts with only light edits, test vs <Term t="control group">control</Term>, weeks 7–12.
            </p>
          </Reveal>
          <Reveal className="kpi" delay={80}>
            <p className="kpi-label">How sure we are</p>
            <p className="kpi-value">
              {ci.diff >= 0 ? '+' : ''}
              {(ci.diff * 100).toFixed(1)} <span>pts</span>
            </p>
            <p className="kpi-note">
              Gap between the <Term t="team-level">average test team</Term> and the average control team.{' '}
              <Term t="confidence interval">95% range</Term>: {(ci.low * 100).toFixed(1)} to {(ci.high * 100).toFixed(1)} pts.{' '}
              {ci.low > 0 ? 'Above zero, so unlikely to be luck.' : 'Includes zero, so it could be luck.'}
            </p>
          </Reveal>
          <Reveal className="kpi" delay={160}>
            <p className="kpi-label">Early signals on target</p>
            <p className="kpi-value">
              {met} <span>of 5</span>
            </p>
            <p className="kpi-note">
              One <Term t="early signal">signal</Term> per cause: did each fix do its own job?
            </p>
          </Reveal>
          <Reveal className="kpi" delay={240}>
            <p className="kpi-label">Safeguards holding</p>
            <p className={`kpi-value ${breaches ? 'tone-bad' : ''}`}>
              {4 - breaches} <span>of 4</span>
            </p>
            <p className="kpi-note">
              <Term t="safeguard">Safeguards</Term> are things that must not get worse, such as errors reaching customers.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
