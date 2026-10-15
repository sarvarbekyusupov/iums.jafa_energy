/**
 * Summary of one day's power curve: energy is power integrated over time, not the sum of the
 * samples. Summing five-minute kW readings reported 3 408 kWh for a 65 kW plant's day on
 * 2026-10-14, about twelve times the real 285 kWh.
 */
export function powerDayStats(points: { time: string | number; value: number }[]) {
  const pts = points
    .map((p) => ({ t: new Date(p.time).getTime(), v: Number(p.value) || 0 }))
    .filter((p) => Number.isFinite(p.t))
    .sort((a, b) => a.t - b.t);
  if (!pts.length) return { energyKwh: 0, avgKw: 0, peakKw: 0 };
  const MAX_GAP_H = 0.25; // a missing stretch longer than 15 minutes is not filled in
  let energy = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const hours = Math.min((pts[i + 1].t - pts[i].t) / 3_600_000, MAX_GAP_H);
    energy += ((pts[i].v + pts[i + 1].v) / 2) * hours;
  }
  const producing = pts.filter((p) => p.v > 0);
  return {
    energyKwh: energy,
    avgKw: producing.length ? producing.reduce((s, p) => s + p.v, 0) / producing.length : 0,
    peakKw: Math.max(...pts.map((p) => p.v)),
  };
}
