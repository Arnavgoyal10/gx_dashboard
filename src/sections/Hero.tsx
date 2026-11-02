import ReviewMock from '../components/ReviewMock';
import { Reveal } from '../components/motion';
import { Term } from '../components/ui';

const STEPS = [
  { n: '1', title: 'Pick a scenario', text: 'Use the bar at the top. Each scenario is a ‘what if’ for how the pilot could turn out.' },
  { n: '2', title: 'Read the decision', text: 'The answer shows ship, improve or stop, using rules agreed before the test started.' },
  { n: '3', title: 'Scroll for the why', text: 'Each section answers one question in plain words. Dotted words explain themselves on hover or tap.' },
];

export default function Hero() {
  return (
    <section className="sec black hero" id="top">
      <div className="wrap hero-grid">
        <Reveal from="left">
          <p className="eyebrow">Case study prototype · AI writing assistant for marketing teams</p>
          <h1>
            Can marketers <em>trust</em> AI drafts enough to send them?
          </h1>
          <p className="hero-serif">A 6-week pilot, measured end to end</p>
          <p className="hero-text">
            Marketing teams like the ideas their AI tool writes, but rewrite most drafts before sending. Two fixes are tested: a{' '}
            <Term t="Brand Kit" /> so drafts start from the team’s own facts and voice, and <Term t="Review mode" /> so users can see what to
            check. This page shows whether more drafts now go out with only <Term t="light edit">light edits</Term>, why, and whether anything got
            worse.
          </p>
          <div className="hero-actions">
            <a className="btn" href="#answer">
              See the answer
            </a>
            <a className="btn btn-ghost" href="#guide">
              How to read this page
            </a>
          </div>
        </Reveal>
        <Reveal from="right" delay={150}>
          <ReviewMock />
        </Reveal>
      </div>

      <div className="wrap" id="guide">
        <Reveal>
          <h3 className="guide-title">How to read this page</h3>
        </Reveal>
        <div className="guide">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 120} className="guide-card">
              <span className="guide-n">{s.n}</span>
              <div>
                <p className="guide-h">{s.title}</p>
                <p>{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="sim-note">
            <b>About the data:</b> every number below is simulated from assumptions listed in the Method section, except the survey figure
            marked ‘Real survey data’. The point is the design: what to track, how each number is calculated, and how the decision is made.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
