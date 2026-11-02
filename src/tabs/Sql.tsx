import { useState } from 'react';
import { Card } from '../components/ui';
import { EVENTS, QUERIES, TABLES } from '../content/sql';

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="copy"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        });
      }}
    >
      {done ? 'Copied' : 'Copy SQL'}
    </button>
  );
}

export default function Sql() {
  return (
    <>
      <Card title="Tracking plan" subtitle="Events the product must log from Sprint 1, so the ‘before’ level exists before anything launches.">
        <table className="table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Fires when</th>
              <th>Key properties</th>
              <th>Feeds</th>
            </tr>
          </thead>
          <tbody>
            {EVENTS.map((e) => (
              <tr key={e.name}>
                <td><code>{e.name}</code></td>
                <td>{e.when}</td>
                <td className="muted">{e.properties}</td>
                <td>{e.feeds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="Data model" subtitle="Modelled tables the queries below read from (PostgreSQL).">
        <div className="tables">
          {TABLES.map((t) => (
            <div key={t.name} className="table-chip">
              <code>{t.name}</code>
              <span>{t.cols}</span>
            </div>
          ))}
        </div>
      </Card>
      {QUERIES.map((q) => (
        <Card key={q.title} title={q.title} subtitle={q.why}>
          <div className="sql-wrap">
            <CopyButton text={q.sql} />
            <pre className="sql">{q.sql}</pre>
          </div>
        </Card>
      ))}
    </>
  );
}
