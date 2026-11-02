import { Reveal } from '../components/motion';
import { Card, SectionHead, Term } from '../components/ui';
import { EditMixChart, FunnelChart, HistogramChart } from '../components/charts';
import { fmt, type Dashboard } from '../lib/metrics';

export default function DeepDive({ d }: { d: Dashboard }) {
  return (
    <section className="sec white" id="deep-dive">
      <div className="wrap">
        <SectionHead
          eyebrow="5 · Deep dive"
          title={
            <>
              Where do drafts <em>drop out</em>, and where does it work?
            </>
          }
          intro="Four views for finding the next thing to fix. All cover weeks 7–12, after launch; the edit-type chart also shows weeks 1–2 for comparison."
        />
        <div className="grid-1-1">
          <Reveal from="left">
            <Card
              className="card-grey"
              title="Where email drafts drop out"
              howTo={
                <>
                  Each bar is a share of all email drafts the AI generated. For Publish mode teams, the biggest drop comes at the step{' '}
                  <b>‘{d.bottleneck.toLowerCase()}’</b>, so that is the <Term t="funnel">bottleneck</Term> to look at first.
                </>
              }
            >
              <FunnelChart d={d} />
            </Card>
          </Reveal>
          <Reveal from="right" delay={120}>
            <Card
              className="card-grey"
              title="How much of each draft gets rewritten"
              howTo="Each bar is the share of sent email drafts whose words changed by that much. Solid bars are light edits (25% or fewer words changed); faded bars are heavier rewrites. If the fixes work, blue piles up on the solid side."
            >
              <HistogramChart d={d} />
            </Card>
          </Reveal>
          <Reveal from="left">
            <Card
              className="card-grey"
              title="What users change when they do rewrite"
              howTo="The main type of edit on drafts that were rewritten more than lightly. If the Brand Kit works, tone and facts shrink; what’s left is ordinary editing like length and structure."
            >
              <EditMixChart d={d} />
            </Card>
          </Reveal>
          <Reveal from="right" delay={120}>
            <Card
              className="card-grey"
              title="Where it works, and where it doesn’t"
              howTo={
                <>
                  Each <Term t="segment" /> compares Publish mode teams with control teams. Green means it clears the 1.5× bar. Segments hold only a few
                  teams each, so treat gaps as questions to investigate, not conclusions.
                </>
              }
            >
              <table className="table">
                <thead>
                  <tr>
                    <th>Segment</th>
                    <th>Test</th>
                    <th>Control</th>
                    <th>Ratio</th>
                    <th>Teams</th>
                  </tr>
                </thead>
                <tbody>
                  {d.segments.map((s) => (
                    <tr key={s.name}>
                      <td>{s.name}</td>
                      <td>{fmt.pct(s.test, 1)}</td>
                      <td>{fmt.pct(s.control, 1)}</td>
                      <td className={s.ratio >= 1.5 ? 'cell-good' : 'cell-warn'}>{s.ratio.toFixed(2)}×</td>
                      <td className="nowrap">{s.teams}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
