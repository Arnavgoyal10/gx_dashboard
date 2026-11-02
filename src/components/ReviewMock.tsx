// An illustration of Fix 2 (Review mode) for the hero, matching slide 2 of the deck.

export default function ReviewMock() {
  return (
    <figure className="mock" aria-label="Illustration of Review mode marking facts in an email draft">
      <div className="mock-bar">
        <span>Review mode · email draft</span>
        <span className="mock-count">3 of 4 facts matched</span>
      </div>
      <div className="mock-body">
        <p>
          Our Pro plan now includes <mark className="m-ok">unlimited reports</mark>
        </p>
        <p>
          Upgrade by <mark className="m-ok">31 March</mark> and save <mark className="m-ok">15%</mark>
        </p>
        <p>
          <mark className="m-warn">Trusted by 10,000+ teams</mark> <span className="m-note warn">No source found</span>
        </p>
        <p>
          <mark className="m-bad">A game-changing upgrade</mark> <span className="m-note bad">Banned hype word</span>
        </p>
        <div className="mock-actions">
          <span className="mock-btn solid">Share for approval</span>
          <span className="mock-btn">Export to Google Docs</span>
        </div>
      </div>
      <figcaption>
        <span className="key">
          <span className="dot ok" /> matches the team’s sources
        </span>
        <span className="key">
          <span className="dot warn" /> no source: check it
        </span>
        <span className="key">
          <span className="dot bad" /> breaks a brand rule
        </span>
      </figcaption>
    </figure>
  );
}
