export const getLossFractionLabel = (f: number): string => {
  const tol = 0.008;
  if (f >= 0.90 - tol) return 'nearly all of';
  if (f > 0.81) return 'nearly 90% of';
  const levels: { v: number; label: string; neverOver?: boolean; noOf?: boolean }[] = [
    { v: 0.15, label: '15%',           neverOver: true },
    { v: 0.20, label: '20%',           neverOver: true },
    { v: 0.25, label: 'a quarter' },
    { v: 1/3,  label: 'a third' },
    { v: 0.40, label: '40%' },
    { v: 0.50, label: 'half',          noOf: true },
    { v: 0.60, label: '60%' },
    { v: 2/3,  label: 'two thirds' },
    { v: 0.75, label: 'three quarters' },
  ];
  const of = (l: { noOf?: boolean }) => l.noOf ? '' : ' of';
  if (f < levels[0].v - tol) return f < 0.11 ? 'a portion of' : `nearly ${levels[0].label} of`;
  for (let i = 0; i < levels.length; i++) {
    const cur = levels[i];
    const nxt = levels[i + 1];
    if (Math.abs(f - cur.v) <= tol) return `${cur.label}${of(cur)}`;
    if (!nxt) return `over ${cur.label}${of(cur)}`;
    if (f > cur.v + tol && f < nxt.v - tol) {
      if (cur.neverOver) return `nearly ${nxt.label}${of(nxt)}`;
      return f < (cur.v + nxt.v) / 2 ? `over ${cur.label}${of(cur)}` : `nearly ${nxt.label}${of(nxt)}`;
    }
  }
  return 'a portion of';
};

export const clampNumber = (value: number, min: number | undefined, max: number | undefined, fallback: number): number => {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  let next = value;
  if (typeof min === 'number') {
    next = Math.max(min, next);
  }
  if (typeof max === 'number') {
    next = Math.min(max, next);
  }
  return next;
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const formatCurrency = (val: number): string => currencyFormatter.format(val || 0);

export const formatCompact = (val: number): string => {
  const abs = Math.abs(val || 0);
  if (abs >= 1_000_000) return `$${(val / 1_000_000).toPrecision(4)}M`;
  if (abs >= 1_000) return `$${(val / 1_000).toPrecision(4)}K`;
  return formatCurrency(val);
};
