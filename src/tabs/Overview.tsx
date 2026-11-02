import { Card, Kpi, Note } from '../components/ui';
import { HeadlineChart, TrustChart } from '../components/charts';
import { DESIGN } from '../data/scenarios';
import { fmt, type Dashboard, type Verdict } from '../lib/metrics';

const VERDICT: Record<Verdict, { word: string; tone: string; line: string }> = {
  ship: { word: 'Ship', tone: 'good', line: 'Roll Publish mode out to all email teams, then social.' },
  improve: { word: 'Improve, then re-test', tone: 'warn', line: 'Fix what the missed signals point to before scaling.' },
  stop: { word: 'Stop and fix', tone: 'bad', line: 'Do not scale until the breached safeguard is back within its limit.' },
  'keep-testing': { word: 'Rethink', tone: 'neutral', line: 'Go back to the causes before building more.' },
};

export default function Overview({ d }: { d: Dashboard }) {
  const v = VERDICT[d.verdict];
  const { test, control, ratio, ci } = d.headline;
  const breaches = d.safeguards.filter((s) => s.breached).length;
  const met = d.signals.filter((s) => s.met).length;
  return (
    <>
      <section className={`verdict verdict-${v.tone}`}>
        <div>
          <p className="verdict-label">Decision after 6 weeks</p>
          <p className="verdict-word">{v.word}</p>
          <p className="verdict-line">{v.line}</p>
        </div>
        <ul className="verdict-reasons">
          {d.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>
      <p className="rules">
        <b>Rules agreed before the test:</b> <span className="r-good">Ship</span> if the headline is at least {DESIGN.shipRatio}× control and every safeguard holds ·{' '}
        <span className="r-warn">Improve</span> if 3+ early signals hit target but the headline doesn’t · <span className="r-bad">Stop</span> if any safeguard is breached.
      </p>

      <div className="kpis">
        <Kpi
          label="Headline: email drafts sent with light edits"
          value={`${fmt.pct(test, 1)} vs ${fmt.pct(control, 1)}`}
          detail={`Test vs control, weeks 7–12 · ${ratio.toFixed(2)}× control`}
          tone={ratio >= DESIGN.shipRatio ? 'good' : 'warn'}
        />
        <Kpi
          label="Difference, with 95% confidence interval"
          value={`${ci.diff >= 0 ? '+' : ''}${(ci.diff * 100).toFixed(1)} pts`}
          detail={`${(ci.low * 100).toFixed(1)} to ${(ci.high * 100).toFixed(1)} pts · team-level averages, ${d.headline.teamRates.test.length} vs ${d.headline.teamRates.control.length} teams`}
          tone={ci.low > 0 ? 'good' : 'warn'}
        />
        <Kpi
          label="Early signals on target"
          value={`${met} of 5`}
          detail="One per cause: did each fix do its job?"
          tone={met >= 3 ? 'good' : 'warn'}
        />
        <Kpi
          label="Safeguards holding"
          value={`${4 - breaches} of 4`}
          detail={breaches ? 'A breach overrides any headline gain' : 'Errors, results, brainstorming, flag noise'}
          tone={breaches ? 'bad' : 'good'}
        />
      </div>

      <div className="grid-2-1">
        <Card
          title="Headline metric by week"
          subtitle={`Share of sent email drafts with 25% or fewer of their words changed. ‘Pre 1–2’ are the two weeks before launch: today’s level is ${fmt.pct(d.today, 1)}, and the target is 2× that within 90 days.`}
        >
          <HeadlineChart d={d} />
          <Note>Test teams ramp up over ~3 weeks after launch, so the first weeks understate the steady-state effect.</Note>
        </Card>
        <Card title="Trust rating by week" subtitle="‘How ready to send was this draft?’ 1 = rewrote it, 5 = sent as is. Asked after export.">
          <TrustChart d={d} />
          <Note>Cause 5 says trust never builds. If the fixes work, this line should climb week after week.</Note>
        </Card>
      </div>
    </>
  );
}
