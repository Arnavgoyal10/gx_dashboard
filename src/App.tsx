import { useEffect, useMemo, useState } from 'react';
import { simulate } from './data/simulate';
import type { ScenarioId } from './data/scenarios';
import { computeDashboard } from './lib/metrics';
import { NAV, Nav, ScenarioBar } from './sections/Top';
import Hero from './sections/Hero';
import Answer from './sections/Answer';
import Results from './sections/Results';
import Signals from './sections/Signals';
import Safety from './sections/Safety';
import DeepDive from './sections/DeepDive';
import Measured from './sections/Measured';
import Method from './sections/Method';
import Closing from './sections/Closing';

/** Highlights the nav link for the section currently on screen. */
function useActiveSection(): string {
  const [active, setActive] = useState('');
  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

export default function App() {
  const [scenario, setScenario] = useState<ScenarioId>('works');
  const d = useMemo(() => computeDashboard(simulate(scenario)), [scenario]);
  const active = useActiveSection();

  return (
    <>
      <Nav active={active} />
      <ScenarioBar scenario={scenario} onChange={setScenario} />
      <main>
        <Hero />
        <Answer d={d} />
        <Results d={d} />
        <Signals d={d} />
        <Safety d={d} />
        <DeepDive d={d} />
        <Measured />
        <Method d={d} />
      </main>
      <Closing />
    </>
  );
}
