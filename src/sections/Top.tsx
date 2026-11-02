import { useState } from 'react';
import { SCENARIOS, SCENARIO_ORDER, type ScenarioId } from '../data/scenarios';

export const NAV = [
  { id: 'answer', label: 'The answer' },
  { id: 'results', label: 'Headline' },
  { id: 'signals', label: 'Signals' },
  { id: 'safety', label: 'Safeguards' },
  { id: 'deep-dive', label: 'Deep dive' },
  { id: 'measured', label: 'Tracking' },
  { id: 'sql', label: 'SQL' },
  { id: 'method', label: 'Method' },
];

export function Nav({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  return (
    <nav className="nav" aria-label="Sections">
      <a className="brand" href="#top" onClick={() => setOpen(false)}>
        <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="7" fill="#fff" />
          <rect x="7" y="17" width="4" height="8" rx="1" fill="#0064FF" />
          <rect x="14" y="11" width="4" height="14" rx="1" fill="#0064FF" />
          <rect x="21" y="7" width="4" height="18" rx="1" fill="#000" />
        </svg>
        <span>Publish mode pilot</span>
      </a>
      <div className={`nav-links ${open ? 'open' : ''}`}>
        {NAV.map((n) => (
          <a
            key={n.id}
            href={`#${n.id}`}
            className={`${active === n.id ? 'on' : ''} ${n.id === 'sql' ? 'nav-sql' : ''}`}
            onClick={() => setOpen(false)}
          >
            {n.id === 'sql' && (
              <span className="nav-code" aria-hidden="true">
                {'</>'}
              </span>
            )}
            {n.label}
          </a>
        ))}
      </div>
      <span className="sim-pill" title="All numbers on this page are simulated from stated assumptions, except where marked as real survey data.">
        Simulated data
      </span>
      <button className="burger" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span />
        <span />
        <span />
      </button>
    </nav>
  );
}

export function ScenarioBar({ scenario, onChange }: { scenario: ScenarioId; onChange: (s: ScenarioId) => void }) {
  return (
    <div className="scenario-bar" role="region" aria-label="Scenario">
      <div className="scenario-inner">
        <p className="scenario-label">
          <b>Try a scenario</b>
          <span>What if the pilot turned out like this?</span>
        </p>
        <div className="scenario-pills" role="group" aria-label="Choose a scenario">
          {SCENARIO_ORDER.map((id) => (
            <button key={id} className={id === scenario ? 'on' : ''} aria-pressed={id === scenario} onClick={() => onChange(id)}>
              {SCENARIOS[id].label}
            </button>
          ))}
        </div>
        <p className="scenario-story">{SCENARIOS[scenario].story}</p>
      </div>
    </div>
  );
}
