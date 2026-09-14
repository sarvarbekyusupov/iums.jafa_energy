/** Uzbek sum, grouped the way people read it here: 1 612 539 so'm. */
export const formatUzs = (value?: number | string | null): string => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  return `${new Intl.NumberFormat('uz-UZ').format(Math.round(n))} so'm`;
};

/** Millions get shortened so a 15-day total does not overflow its tile. */
export const formatUzsShort = (value?: number | string | null): string => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  if (Math.abs(n) >= 1_000_000) {
    return `${new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 1 }).format(n / 1_000_000)} mln so'm`;
  }
  return formatUzs(n);
};

export const formatKwh = (value?: number | string | null, digits = 0): string => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  if (Math.abs(n) >= 1000) {
    return `${new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 2 }).format(n / 1000)} MWh`;
  }
  return `${new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: digits }).format(n)} kWh`;
};
