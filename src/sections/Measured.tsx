import { useState } from 'react';
import { Reveal } from '../components/motion';
import { SectionHead } from '../components/ui';
import { EVENTS, QUERIES, TABLES } from '../content/sql';

function Copy({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="copy"
      onClick={(e) => {
        e.preventDefault();
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

export default function Measured() {
  return (
    <section className="sec black" id="measured">
      <div className="wrap">
        <SectionHead
          eyebrow="6 · How it’s measured"
          title={
            <>
              Every number traces back to <em>an event and a query</em>
            </>
          }
          intro="The product starts logging these events in Sprint 1, two weeks before launch, so ‘today’s level’ exists before anything changes. The SQL (PostgreSQL) below turns them into each number on this page."
        />

        <Reveal className="card">
          <h3 className="card-title">Tracking plan: what the product logs</h3>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Fires when</th>
                  <th>Key details stored</th>
                  <th>Used for</th>
                </tr>
              </thead>
              <tbody>
                {EVENTS.map((e) => (
                  <tr key={e.name}>
                    <td>
                      <code>{e.name}</code>
                    </td>
                    <td>{e.when}</td>
                    <td className="muted">{e.properties}</td>
                    <td>{e.feeds}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal className="card">
          <h3 className="card-title">Data model: the tables the queries read</h3>
          <div className="chips">
            {TABLES.map((t) => (
              <div key={t.name} className="table-chip">
                <code>{t.name}</code>
                <span>{t.cols}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <h3 className="sql-title">The queries (click one to open it)</h3>
        </Reveal>
        <div className="sql-list">
          {QUERIES.map((q, i) => (
            <Reveal key={q.title} delay={i * 50}>
              <details className="sql-item">
                <summary>
                  <span className="sql-h">{q.title}</span>
                  <span className="sql-why">{q.why}</span>
                </summary>
                <div className="sql-wrap">
                  <Copy text={q.sql} />
                  <pre className="sql">{q.sql}</pre>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
