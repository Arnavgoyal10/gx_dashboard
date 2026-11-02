import { useMemo, useState } from 'react';
import { simulate } from './data/simulate';
import { SCENARIOS, SCENARIO_ORDER, type ScenarioId } from './data/scenarios';
import { computeDashboard } from './lib/metrics';
import Overview from './tabs/Overview';
import Funnel from './tabs/Funnel';
import Signals from './tabs/Signals';
import Sql from './tabs/Sql';
import Method from './tabs/Method';

type Tab = 'overview' | 'funnel' | 'signals' | 'sql' | 'method';
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'funnel', label: 'Funnel & segments' },
  { id: 'signals', label: 'Signals & safeguards' },
  { id: 'sql', label: 'Tracking plan & SQL' },
  { id: 'method', label: 'Method' },
];

export default function App() {
  const [scenario, setScenario] = useState<ScenarioId>('works');
  const [tab, setTab] = useState<Tab>('overview');
  const dashboard = useMemo(() => computeDashboard(simulate(scenario)), [scenario]);

  return (
    <div className="page">
      <header className="top">
        <div>
          <p className="eyebrow">Case study prototype · AI writing assistant for marketing teams</p>
          <h1>Publish mode pilot: trust &amp; adoption dashboard</h1>
          <p className="lede">
            The dashboard I would use to run the 6-week pilot from my case study: did the two fixes make AI drafts trusted enough to send with
            light edits, without more errors?
          </p>
        </div>
        <span className="sim-badge">Simulated data · not real results</span>
      </header>

      <section className="scenario">
        <div className="scenario-head">
          <p className="scenario-title">Scenario</p>
          <div className="seg" role="tablist" aria-label="Scenario">
            {SCENARIO_ORDER.map((id) => (
              <button key={id} className={id === scenario ? 'on' : ''} onClick={() => setScenario(id)} role="tab" aria-selected={id === scenario}>
                {SCENARIOS[id].label}
              </button>
            ))}
          </div>
        </div>
        <p className="scenario-story">{SCENARIOS[scenario].story}</p>
      </section>

      <nav className="tabs" role="tablist" aria-label="Sections">
        {TABS.map((t) => (
          <button key={t.id} className={t.id === tab ? 'on' : ''} onClick={() => setTab(t.id)} role="tab" aria-selected={t.id === tab}>
            {t.label}
          </button>
        ))}
      </nav>

      <main>
        {tab === 'overview' && <Overview d={dashboard} />}
        {tab === 'funnel' && <Funnel d={dashboard} />}
        {tab === 'signals' && <Signals d={dashboard} />}
        {tab === 'sql' && <Sql />}
        {tab === 'method' && <Method d={dashboard} />}
      </main>

      <footer className="foot">
        Built by Arnav Goyal for the Galytix Product Analyst case study. All figures are simulated from stated assumptions (see Method); the survey statistic
        quoted on the safeguards tab is real and sourced.
      </footer>
    </div>
  );
}
