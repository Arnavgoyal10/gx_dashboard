import { Reveal } from '../components/motion';
import { Chip, SectionHead, Term } from '../components/ui';
import type { Dashboard } from '../lib/metrics';

const WHY: Record<string, string> = {
  kit: 'Fix 1 only works if teams actually set up their Brand Kit.',
  regen: 'Fewer re-rolls mean drafts are reliably usable, not a lottery.',
  review: 'Review mode should make checking a draft much faster.',
  approval: 'Approvers who can see sources and checks send fewer drafts back.',
  trust: 'Trust should build week after week as drafts prove themselves.',
};

export default function Signals({ d }: { d: Dashboard }) {
  return (
    <section className="sec white" id="signals">
      <div className="wrap">
        <SectionHead
          eyebrow="3 · Early signals"
          title={
            <>
              Did each fix do <em>its job</em>?
            </>
          }
          intro={
            <>
              The case points to five causes of distrust. Each has one <Term t="early signal" /> that shows whether its fix worked, so we can
              see why the headline moved, or why it didn’t. ‘Today’ is the level before launch; targets were set before the test.
            </>
          }
        />
        <div className="signal-grid">
          {d.signals.map((s, i) => {
            const [num, name] = s.cause.split(' · ');
            return (
              <Reveal key={s.key} delay={i * 90} className={`signal ${s.met ? '' : 'signal-miss'}`}>
                <div className="signal-top">
                  <span className="cause-n">Cause {num}</span>
                  <Chip ok={s.met} okText="On target" badText="Missed" />
                </div>
                <p className="signal-cause">{name}</p>
                <p className="signal-name">{s.name}</p>
                <p className="signal-value">{s.test}</p>
                <p className="signal-sub">
                  {s.key === 'trust'
                    ? 'Publish mode teams, final week'
                    : s.key === 'kit'
                      ? 'Publish mode teams, launch week (Wk 7)'
                      : 'Publish mode teams, weeks 7–12'}
</p>
                <dl className="signal-compare">
                  <div>
                    <dt>Today</dt>
                    <dd>{s.today}</dd>
                  </div>
                  <div>
                    <dt>Control</dt>
                    <dd>{s.control}</dd>
                  </div>
                  <div>
                    <dt>Target</dt>
                    <dd>{s.target}</dd>
                  </div>
                </dl>
                <p className="signal-why">{WHY[s.key]}</p>
                <p className="signal-event">
                  Logged as <code>{s.how}</code>
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
