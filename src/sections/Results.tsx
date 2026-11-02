import { Reveal } from '../components/motion';
import { Card, SectionHead, Term } from '../components/ui';
import { HeadlineChart, TrustChart } from '../components/charts';
import { fmt, type Dashboard } from '../lib/metrics';

export default function Results({ d }: { d: Dashboard }) {
  return (
    <section className="sec black" id="results">
      <div className="wrap">
        <SectionHead
          eyebrow="2 · Headline over time"
          title={
            <>
              Are more drafts sent with only <em>light edits</em>?
            </>
          }
          intro={
            <>
              The headline metric is the share of sent email drafts where 25% or fewer of the words changed from what the AI wrote. ‘Pre 1–2’ are
              the two weeks before launch, which set <Term t="today’s level" /> at {fmt.pct(d.today, 1)}. The goal is to double it within 90 days.
            </>
          }
        />
        <div className="grid-2-1">
          <Reveal from="left">
            <Card
              title="Share of sent email drafts with only light edits"
              howTo={
                <>
                  Blue is the <Term t="test group" />, grey the <Term t="control group" />. The dashed line is the bar to ship: 1.5× the control
                  group. Blue should stay above it once teams settle in (<Term t="ramp-up" />).
                </>
              }
            >
              <HeadlineChart d={d} />
            </Card>
          </Reveal>
          <Reveal from="right" delay={120}>
            <Card
              title="Trust rating by week"
              howTo={
                <>
                  The <Term t="trust rating" /> runs from 1 (rewrote it) to 5 (sent as is). Cause 5 says trust never builds; if the fixes work, the
                  blue line climbs week after week.
                </>
              }
            >
              <TrustChart d={d} />
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
