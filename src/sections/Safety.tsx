import { Reveal } from '../components/motion';
import { Chip, SectionHead, Term } from '../components/ui';
import type { Dashboard } from '../lib/metrics';

const WHY: Record<string, string> = {
  errors: 'Wrong prices or claims must not reach more customers.',
  results: 'Emails written with the AI must still get opened and clicked.',
  explore: 'Brainstorming is what users already love; Publish mode must not crowd it out.',
  dismiss: 'If users wave most flags away, they will start ignoring the real problems too.',
};

export default function Safety({ d }: { d: Dashboard }) {
  return (
    <section className="sec black" id="safety">
      <div className="wrap">
        <SectionHead
          eyebrow="4 · Safeguards"
          title={
            <>
              Did trust come <em>at a cost</em>?
            </>
          }
          intro={
            <>
              More trust is only good if drafts stay accurate and effective. If any of these four <Term t="safeguard">safeguards</Term> gets worse,
              the rollout stops, whatever the headline says.
            </>
          }
        />
        <div className="safe-grid">
          {d.safeguards.map((s, i) => (
            <Reveal key={s.key} delay={i * 90} className={`safe ${s.breached ? 'safe-bad' : ''}`}>
              <div className="signal-top">
                <p className="safe-name">{s.name}</p>
                <Chip ok={!s.breached} okText="Holding" badText="Breached" />
              </div>
              <div className="safe-nums">
                <div>
                  <p className="safe-v">{s.test}</p>
                  <p className="safe-l">Publish mode teams</p>
                </div>
                <div>
                  <p className="safe-v muted">{s.control}</p>
                  <p className="safe-l">Control teams</p>
                </div>
              </div>
              <p className="safe-limit">
                <b>Limit:</b> {s.limit}
              </p>
              <p className="signal-why">{WHY[s.key]}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="evidence">
          <span className="real-tag">Real survey data</span>
          <p className="evidence-num">25%</p>
          <p className="evidence-text">
            of marketing leaders admit knowingly publishing off-brand AI content when deadlines are tight. That is the behaviour these safeguards
            exist to catch.
          </p>
          <p className="evidence-src">
            Source:{' '}
            <a href="https://itbrief.news/story/optimizely-study-finds-marketers-cut-corners-on-ai" target="_blank" rel="noreferrer">
              Optimizely / Savanta survey of 2,003 marketing leaders, June 2026
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
