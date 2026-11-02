import { Card, Note } from '../components/ui';
import { EditMixChart, FunnelChart, HistogramChart } from '../components/charts';
import { fmt, type Dashboard } from '../lib/metrics';

export default function Funnel({ d }: { d: Dashboard }) {
  return (
    <>
      <div className="grid-1-1">
        <Card title="Where email drafts drop out" subtitle="Weeks 7–12. Each bar is a share of all drafts generated in that group.">
          <FunnelChart d={d} />
          <Note>
            Biggest drop for the test group: <b>{d.bottleneck.toLowerCase()}</b>. That stage is where to look first.
          </Note>
        </Card>
        <Card title="How much of each draft gets rewritten" subtitle="Words changed between the AI draft and the version sent (sent email drafts, weeks 7–12).">
          <HistogramChart d={d} />
          <Note>The 25% cut-off sits in the gap between light review edits and real rewrites; Week 0 checks it against users’ own ‘light’ or ‘heavy’ labels.</Note>
        </Card>
      </div>
      <div className="grid-1-1">
        <Card title="What users change when they do rewrite" subtitle="Main type of edit on heavily rewritten drafts. This is the ‘proof to look for’ for cause 1.">
          <EditMixChart d={d} />
          <Note>If tone and facts shrink as a share of edits, the Brand Kit is doing its job; what remains is ordinary editing.</Note>
        </Card>
        <Card title="Where it works, and where it doesn’t" subtitle="Headline metric by segment, weeks 7–12.">
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
                  <td>{s.teams}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Note>Segments are small (a few teams each), so treat differences here as leads to investigate, not conclusions.</Note>
        </Card>
      </div>
    </>
  );
}
