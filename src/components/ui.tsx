import { useId, useState, type ReactNode } from 'react';
import { GLOSSARY } from '../content/glossary';

/** A dotted-underlined word that explains itself on hover, focus or tap. */
export function Term({ t, children }: { t: keyof typeof GLOSSARY | string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const text = GLOSSARY[t];
  if (!text) return <>{children ?? t}</>;
  return (
    <span className="term-wrap" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="term"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children ?? t}
      </button>
      {open && (
        <span role="tooltip" id={id} className="term-pop">
          <b>{t.charAt(0).toUpperCase() + t.slice(1)}</b>
          {text}
        </span>
      )}
    </span>
  );
}

export function SectionHead({
  eyebrow,
  title,
  intro,
  center = false,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  center?: boolean;
}) {
  return (
    <header className={`sec-head ${center ? 'center' : ''}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {intro && <p className="intro">{intro}</p>}
    </header>
  );
}

export function Card({ children, className = '', title, howTo }: { children: ReactNode; className?: string; title?: string; howTo?: ReactNode }) {
  return (
    <div className={`card ${className}`}>
      {title && <h3 className="card-title">{title}</h3>}
      {children}
      {howTo && (
        <p className="howto">
          <span className="howto-tag">How to read it</span> {howTo}
        </p>
      )}
    </div>
  );
}

export function Chip({ ok, okText, badText }: { ok: boolean; okText: string; badText: string }) {
  return <span className={`chip ${ok ? 'chip-ok' : 'chip-bad'}`}>{ok ? `✓ ${okText}` : `✕ ${badText}`}</span>;
}
