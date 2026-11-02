import { Reveal } from '../components/motion';
import { SectionHead } from '../components/ui';
import { EVENTS } from '../content/sql';

export default function Measured() {
  return (
    <section className="sec black" id="measured">
      <div className="wrap">
        <SectionHead
          eyebrow="6 · Tracking plan"
          title={
            <>
              Every number starts as <em>a logged event</em>
            </>
          }
          intro={
            <>
              The product starts logging these events in Sprint 1 (weeks 1–2), well before launch in week 7, so today’s level is known before
              anything changes. The <a href="#sql">SQL section</a> turns them into the numbers on this page.
            </>
          }
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
      </div>
    </section>
  );
}
