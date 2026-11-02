// Team-level statistics. Teams (not users) are the unit of randomisation,
// so differences are tested on team averages, not on pooled drafts.

export const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : NaN);

export function variance(xs: number[]): number {
  if (xs.length < 2) return NaN;
  const m = mean(xs);
  return xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1);
}

/** Two-sided 95% critical value of Student's t (close enough for a dashboard). */
function tCritical95(df: number): number {
  if (df >= 120) return 1.98;
  if (df >= 60) return 2.0;
  if (df >= 40) return 2.021;
  if (df >= 30) return 2.042;
  if (df >= 20) return 2.086;
  if (df >= 15) return 2.131;
  if (df >= 10) return 2.228;
  return 2.571;
}

export interface Comparison {
  diff: number; // a - b
  low: number; // 95% CI lower bound
  high: number; // 95% CI upper bound
  df: number;
}

/** Welch's t interval for the difference in means of two groups of team averages. */
export function welch(a: number[], b: number[]): Comparison {
  const va = variance(a) / a.length;
  const vb = variance(b) / b.length;
  const se = Math.sqrt(va + vb);
  const df = (va + vb) ** 2 / (va ** 2 / (a.length - 1) + vb ** 2 / (b.length - 1));
  const diff = mean(a) - mean(b);
  const t = tCritical95(df);
  return { diff, low: diff - t * se, high: diff + t * se, df };
}

/** Least-squares slope of y over x. */
export function slope(xs: number[], ys: number[]): number {
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let den = 0;
  xs.forEach((x, i) => {
    num += (x - mx) * (ys[i] - my);
    den += (x - mx) ** 2;
  });
  return den === 0 ? 0 : num / den;
}
