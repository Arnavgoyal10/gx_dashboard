import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Dashboard } from '../lib/metrics';

const BLUE = '#0064FF';
const GREY = '#8A8A93';
const INK = '#0A0A0A';
const pct0 = (v: number) => `${Math.round(v * 100)}%`;
const pct1 = (v: number) => `${(v * 100).toFixed(1)}%`;
const axis = { fontSize: 12, fill: '#4B4B55' };
/** Round-number ticks from 0 up to just above the largest value. */
const stepTicks = (max: number, step: number) =>
  Array.from({ length: Math.ceil(max / step + 1e-9) + 1 }, (_, i) => +(i * step).toFixed(4));

export function HeadlineChart({ d }: { d: Dashboard }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={d.weekly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#E8E8EC" vertical={false} />
        <XAxis dataKey="label" tick={axis} />
        <YAxis tickFormatter={pct0} tick={axis} domain={[0, 0.5]} ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5]} width={44} />
        <Tooltip formatter={(v: number) => pct1(v)} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <ReferenceLine x="Wk 7" stroke={INK} strokeDasharray="2 4" label={{ value: 'Launch', position: 'insideTopLeft', fontSize: 12, fill: INK }} />
        <Line type="monotone" dataKey="test" name="Test group (Publish mode)" stroke={BLUE} strokeWidth={3} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="control" name="Control group (today’s tool)" stroke={GREY} strokeWidth={2} dot={{ r: 3 }} />
        <Line type="linear" dataKey="shipBar" name="Ship bar (1.5× control’s average)" stroke={INK} strokeDasharray="6 4" dot={false} connectNulls={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TrustChart({ d }: { d: Dashboard }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={d.trustWeekly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#E8E8EC" vertical={false} />
        <XAxis dataKey="label" tick={{ ...axis, fontSize: 11 }} interval={0} />
        <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={axis} width={30} />
        <Tooltip formatter={(v: number) => v.toFixed(2)} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Line type="monotone" dataKey="test" name="Test group" stroke={BLUE} strokeWidth={3} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="control" name="Control group" stroke={GREY} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function FunnelChart({ d }: { d: Dashboard }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={d.funnel} layout="vertical" margin={{ top: 0, right: 50, left: 10, bottom: 0 }} barGap={2}>
        <CartesianGrid stroke="#E8E8EC" horizontal={false} />
        <XAxis type="number" domain={[0, 1]} tickFormatter={pct0} tick={axis} />
        <YAxis type="category" dataKey="stage" width={160} tick={axis} />
        <Tooltip formatter={(v: number) => pct1(v)} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="test" name="Test group" fill={BLUE}>
          <LabelList dataKey="test" position="right" formatter={pct0} style={{ fontSize: 12, fill: INK }} />
        </Bar>
        <Bar dataKey="control" name="Control group" fill={GREY}>
          <LabelList dataKey="control" position="right" formatter={pct0} style={{ fontSize: 12, fill: INK }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HistogramChart({ d }: { d: Dashboard }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={d.histogram} margin={{ top: 20, right: 10, left: 0, bottom: 0 }} barGap={1}>
        <CartesianGrid stroke="#E8E8EC" vertical={false} />
        <XAxis dataKey="bin" tick={{ ...axis, fontSize: 11 }} ticks={['0–5%', '25–30%', '50–55%', '75–80%']} />
        <YAxis
          tickFormatter={pct0}
          tick={axis}
          width={40}
          ticks={stepTicks(Math.max(...d.histogram.flatMap((h) => [h.test, h.control])), 0.05)}
          domain={[0, 'dataMax']}
        />
        <Tooltip formatter={(v: number) => pct1(v)} labelFormatter={(l: string) => `${l} of words changed`} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="test" name="Test group" fill={BLUE}>
          {d.histogram.map((h) => (
            <Cell key={h.bin} fill={BLUE} fillOpacity={h.light ? 1 : 0.3} />
          ))}
        </Bar>
        <Bar dataKey="control" name="Control group" fill={GREY}>
          {d.histogram.map((h) => (
            <Cell key={h.bin} fill={GREY} fillOpacity={h.light ? 1 : 0.3} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function EditMixChart({ d }: { d: Dashboard }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={d.editMix} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#E8E8EC" vertical={false} />
        <XAxis dataKey="type" tick={axis} interval={0} />
        <YAxis
          tickFormatter={pct0}
          tick={axis}
          width={40}
          ticks={stepTicks(Math.max(...d.editMix.flatMap((e) => [e.before, e.test])), 0.1)}
          domain={[0, 'dataMax']}
        />
        <Tooltip formatter={(v: number) => pct1(v)} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="before" name="Weeks 1–2 (all teams)" fill={GREY} />
        <Bar dataKey="test" name="Test group, weeks 7–12" fill={BLUE} />
      </BarChart>
    </ResponsiveContainer>
  );
}
