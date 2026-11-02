import type { ReactNode } from 'react';

export function Card({ title, subtitle, children, className = '' }: { title?: string; subtitle?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`}>
      {title && <h3 className="card-title">{title}</h3>}
      {subtitle && <p className="card-sub">{subtitle}</p>}
      {children}
    </section>
  );
}

export function Kpi({ label, value, detail, tone = 'default' }: { label: string; value: string; detail?: ReactNode; tone?: 'default' | 'good' | 'bad' | 'warn' }) {
  return (
    <div className={`kpi kpi-${tone}`}>
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">{value}</p>
      {detail && <p className="kpi-detail">{detail}</p>}
    </div>
  );
}

export function Status({ ok, okText = 'On target', badText = 'Missed' }: { ok: boolean; okText?: string; badText?: string }) {
  return <span className={`status ${ok ? 'status-ok' : 'status-bad'}`}>{ok ? `✓ ${okText}` : `✕ ${badText}`}</span>;
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="note">{children}</p>;
}
