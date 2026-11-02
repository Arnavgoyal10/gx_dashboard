import { Card, Note, Status } from '../components/ui';
import type { Dashboard } from '../lib/metrics';

export default function Signals({ d }: { d: Dashboard }) {
  return (
    <>
      <Card title="Early signals: one per cause" subtitle="Did each fix do its job? ‘Today’ is the level in the two weeks before launch. Test and control are weeks 7–12.">
        <table className="table">
          <thead>
            <tr>
              <th>Cause</th>
              <th>What we measure</th>
              <th>Event behind it</th>
              <th>Today</th>
              <th>Test</th>
              <th>Control</th>
              <th>Target</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {d.signals.map((s) => (
              <tr key={s.key}>
                <td><b>{s.cause}</b></td>
                <td>{s.name}</td>
                <td><code>{s.how}</code></td>
                <td>{s.today}</td>
                <td><b>{s.test}</b></td>
                <td>{s.control}</td>
                <td>{s.target}</td>
                <td><Status ok={s.met} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="Safeguards: these must not get worse" subtitle="More trust is only good if drafts stay accurate and effective, and brainstorming isn’t harmed.">
        <table className="table">
          <thead>
            <tr>
              <th>Safeguard</th>
              <th>Event behind it</th>
              <th>Test</th>
              <th>Control</th>
              <th>Limit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {d.safeguards.map((s) => (
              <tr key={s.key} className={s.breached ? 'row-bad' : ''}>
                <td><b>{s.name}</b></td>
                <td><code>{s.how}</code></td>
                <td><b>{s.test}</b></td>
                <td>{s.control}</td>
                <td>{s.limit}</td>
                <td><Status ok={!s.breached} okText="Holding" badText="Breached" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Note>Why errors matter: in a 2025 NP Digital survey of 565 US marketers, 36.5% said wrong AI-generated content had already reached the public.</Note>
      </Card>
    </>
  );
}
