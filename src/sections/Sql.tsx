import { useState } from 'react';
import { Reveal } from '../components/motion';
import { SectionHead } from '../components/ui';
import { QUERIES, TABLES } from '../content/sql';

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

export default function Sql() {
  return (
    <section className="sec white" id="sql">
      <div className="wrap">
        <SectionHead
          eyebrow="7 · SQL"
          title={
            <>
              The queries behind <em>the decision</em>
            </>
          }
          intro="PostgreSQL that turns the tracked events into the headline, every early signal and safeguard, and the funnel. Each query compares the test and control groups; most also return weeks 1–2, which set today’s level. Click a query to open it."
        />

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
