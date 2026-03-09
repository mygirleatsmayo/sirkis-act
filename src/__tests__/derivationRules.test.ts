// src/__tests__/derivationRules.test.ts
import { describe, it, expect } from 'vitest';
import { applyDerivations, extractPrimaries, getModeStatics } from '../themes/derivationRules';
import type { Primaries } from '../themes/derivationRules';
import { cyprusTheme } from '../themes/cyprus';
import { hexToRgb, hexToHsl, relativeLuminance } from '../utils/colorMath';

const cyprusPrimaries: Primaries = {
  bg: '#003D3A',
  brand: '#00A499',
  brandAccent: '#E6C300',
  returns: '#E6C300',
  loss: '#E65C5C',
  startNow: '#5CE6E6',
  opm: '#74c365',
  textPrimary: '#ffffff',
  textSecondary: '#e2e8f0',
  textSubtle: '#8ba3c3',
  textNeutral: '#e2e8f0',
  target: '#00A499',
  selfFunded: '#00A499',
};

/** Check that two hex colors are within ±1 per RGB channel (HSL rounding tolerance) */
const hexCloseTo = (actual: string, expected: string) => {
  const [r1, g1, b1] = hexToRgb(actual.toLowerCase());
  const [r2, g2, b2] = hexToRgb(expected.toLowerCase());
  expect(Math.abs(r1 - r2)).toBeLessThanOrEqual(1);
  expect(Math.abs(g1 - g2)).toBeLessThanOrEqual(1);
  expect(Math.abs(b1 - b2)).toBeLessThanOrEqual(1);
};

/** Normalize rgba string: parse and re-format to handle trailing zero differences */
const normalizeRgba = (s: string): string => {
  const m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/);
  if (!m) return s;
  return `rgba(${+m[1]}, ${+m[2]}, ${+m[3]}, ${+m[4]})`;
};

describe('extractPrimaries', () => {
  it('extracts primaries from Cyprus theme colors', () => {
    const result = extractPrimaries(cyprusTheme.colors);
    expect(result).toEqual(cyprusPrimaries);
  });
});

describe('applyDerivations', () => {
  const derived = applyDerivations(cyprusPrimaries, 'dark');

  // ── bg derivations ──
  it('derives bgGlass as bg +2% lightness', () => {
    hexCloseTo(derived.colors.bgGlass, cyprusTheme.colors.bgGlass);
  });
  it('derives bgInput as bg -3% lightness', () => {
    hexCloseTo(derived.colors.bgInput, cyprusTheme.colors.bgInput);
  });
  it('derives borderDefault as bg +8% lightness', () => {
    hexCloseTo(derived.colors.borderDefault, cyprusTheme.colors.borderDefault);
  });

  // ── brand derivations ──
  it('derives brandBg as brand at alpha 0.06', () => {
    expect(derived.colors.brandBg).toBe(cyprusTheme.colors.brandBg);
  });
  it('derives focusRing as copy of brand', () => {
    expect(derived.colors.focusRing).toBe(cyprusPrimaries.brand);
  });
  it('derives sliderAccent as copy of brand', () => {
    expect(derived.colors.sliderAccent).toBe(cyprusPrimaries.brand);
  });
  it('derives sliderAccentHover as brand -5% lightness', () => {
    // Derivation is a lightness shift; verify it's darker than brand
    const [, , brandL] = hexToHsl(cyprusPrimaries.brand);
    const [, , hoverL] = hexToHsl(derived.colors.sliderAccentHover);
    expect(hoverL).toBeLessThan(brandL);
    expect(brandL - hoverL).toBeCloseTo(5, 0);
  });
  it('derives heroLine1Color as copy of brand', () => {
    expect(derived.heroLine1Color).toBe(cyprusPrimaries.brand);
  });
  it('derives logoColor as copy of brand', () => {
    expect(derived.logoColor).toBe(cyprusPrimaries.brand);
  });

  // ── returns derivations ──
  it('derives returnsBg as returns at alpha 0.08', () => {
    expect(derived.colors.returnsBg).toBe(cyprusTheme.colors.returnsBg);
  });
  it('derives heroLine2Color as copy of brandAccent', () => {
    expect(derived.heroLine2Color).toBe(cyprusPrimaries.brandAccent);
  });
  it('derives glowColor from brandAccent at alpha 0.50', () => {
    expect(normalizeRgba(derived.glowColor)).toBe(normalizeRgba(cyprusTheme.effects.glowColor));
  });
  it('derives blobColors from brandAccent at correct alphas', () => {
    expect(normalizeRgba(derived.blobColors[0])).toBe(normalizeRgba(cyprusTheme.effects.blobs[0].color));
    expect(normalizeRgba(derived.blobColors[1])).toBe(normalizeRgba(cyprusTheme.effects.blobs[1].color));
  });

  // ── loss derivation ──
  it('derives lossBg as loss at alpha 0.07', () => {
    expect(derived.colors.lossBg).toBe(cyprusTheme.colors.lossBg);
  });

  // ── opm derivations ──
  it('passes opm through unchanged', () => {
    expect(derived.colors.opm).toBe(cyprusPrimaries.opm);
  });
  it('derives opmBg as opm at alpha 0.08', () => {
    expect(derived.colors.opmBg).toBe(cyprusTheme.colors.opmBg);
  });

  // ── neutralBg derivation ──
  it('derives neutralBg from textNeutral at alpha 0.10', () => {
    expect(normalizeRgba(derived.colors.neutralBg)).toBe(normalizeRgba('rgba(226, 232, 240, 0.10)'));
  });
  it('derives neutralBg from the provided textNeutral primary', () => {
    const custom = applyDerivations({ ...cyprusPrimaries, textNeutral: '#112233' }, 'dark');
    expect(normalizeRgba(custom.colors.neutralBg)).toBe(normalizeRgba('rgba(17, 34, 51, 0.10)'));
  });

  // ── mutedBg derivation ──
  it('derives mutedBg as darkening overlay in dark mode', () => {
    expect(derived.colors.mutedBg).toBe('rgba(0, 0, 0, 0.08)');
  });
  it('derives mutedBg as subtle darkening overlay in light mode', () => {
    const light = applyDerivations(cyprusPrimaries, 'light');
    expect(light.colors.mutedBg).toBe('rgba(0, 0, 0, 0.04)');
  });

  // ── text primaries (standalone) ──
  it('textSecondary passes through as primary', () => {
    expect(derived.colors.textSecondary).toBe(cyprusPrimaries.textSecondary);
  });
  it('textSecondary is customizable per theme', () => {
    const custom = applyDerivations({ ...cyprusPrimaries, textSecondary: '#aabbcc' }, 'dark');
    expect(custom.colors.textSecondary).toBe('#aabbcc');
  });
  it('textSubtle passes through as primary', () => {
    expect(derived.colors.textSubtle).toBe(cyprusPrimaries.textSubtle);
  });
  it('textSubtle is customizable per theme', () => {
    const custom = applyDerivations({ ...cyprusPrimaries, textSubtle: '#667788' }, 'dark');
    expect(custom.colors.textSubtle).toBe('#667788');
  });

  // ── projection derivations ──
  it('derives target as copy of target primary', () => {
    expect(derived.colors.target).toBe(cyprusPrimaries.target);
  });
  it('derives targetBg from target at alpha 0.06', () => {
    expect(derived.colors.targetBg).toBe(cyprusTheme.colors.targetBg);
  });
  it('derives selfFunded as copy of selfFunded primary', () => {
    expect(derived.colors.selfFunded).toBe(cyprusPrimaries.selfFunded);
  });
  it('derives selfFundedBg from selfFunded at alpha 0.06', () => {
    expect(derived.colors.selfFundedBg).toBe(cyprusTheme.colors.selfFundedBg);
  });
  it('projection tokens are independent of brand', () => {
    const custom = applyDerivations({ ...cyprusPrimaries, target: '#FF0000', selfFunded: '#0000FF', brand: '#999999' }, 'dark');
    expect(custom.colors.target).toBe('#FF0000');
    expect(custom.colors.selfFunded).toBe('#0000FF');
    expect(custom.colors.brand).toBe('#999999');
  });

  // ── primaries pass through ──
  it('includes primaries in output colors', () => {
    expect(derived.colors.bg).toBe(cyprusPrimaries.bg);
    expect(derived.colors.brand).toBe(cyprusPrimaries.brand);
    expect(derived.colors.returns).toBe(cyprusPrimaries.returns);
    expect(derived.colors.loss).toBe(cyprusPrimaries.loss);
    expect(derived.colors.startNow).toBe(cyprusPrimaries.startNow);
    expect(derived.colors.textPrimary).toBe(cyprusPrimaries.textPrimary);
    expect(derived.colors.textSecondary).toBe(cyprusPrimaries.textSecondary);
    expect(derived.colors.textSubtle).toBe(cyprusPrimaries.textSubtle);
    expect(derived.colors.textNeutral).toBe(cyprusPrimaries.textNeutral);
    expect(derived.colors.target).toBe(cyprusPrimaries.target);
    expect(derived.colors.selfFunded).toBe(cyprusPrimaries.selfFunded);
  });
});

describe('getModeStatics', () => {
  it('returns only scrollbar statics for dark mode', () => {
    const dark = getModeStatics('dark');
    expect(dark.scrollbarThumb).toBe('rgba(148, 163, 184, 0.3)');
    expect(dark.scrollbarThumbHover).toBe('rgba(148, 163, 184, 0.5)');
    // These are now derived, not statics
    expect(dark.textSecondary).toBeUndefined();
    expect(dark.bgOverlay).toBeUndefined();
    expect(dark.borderSubtle).toBeUndefined();
    expect(dark.toggleOff).toBeUndefined();
  });
  it('returns only scrollbar statics for light mode', () => {
    const light = getModeStatics('light');
    expect(light.scrollbarThumb).toBe('rgba(100, 116, 139, 0.3)');
    expect(light.scrollbarThumbHover).toBe('rgba(100, 116, 139, 0.5)');
    expect(light.textSecondary).toBeUndefined();
    expect(light.bgOverlay).toBeUndefined();
    expect(light.borderSubtle).toBeUndefined();
    expect(light.toggleOff).toBeUndefined();
  });
});

describe('bg-derived UI tokens', () => {
  const derived = applyDerivations(cyprusPrimaries, 'dark');

  it('derives borderSubtle based on bg luminance (dark bg → white overlay)', () => {
    expect(relativeLuminance(cyprusPrimaries.bg)).toBeLessThan(0.5);
    expect(derived.colors.borderSubtle).toBe('rgba(255, 255, 255, 0.06)');
  });
  it('derives borderSubtle as black overlay for light bg', () => {
    const light = applyDerivations({ ...cyprusPrimaries, bg: '#f0f0f0' }, 'light');
    expect(light.colors.borderSubtle).toBe('rgba(0, 0, 0, 0.06)');
  });
  it('derives bgOverlay from bg (darkened + alpha)', () => {
    expect(derived.colors.bgOverlay).toMatch(/^rgba\(/);
  });
  it('derives toggleOff with bg hue tint (dark mode: high lightness)', () => {
    const [, , toggleL] = hexToHsl(derived.colors.toggleOff);
    expect(toggleL).toBeGreaterThan(70);
    expect(toggleL).toBeLessThan(95);
  });
  it('derives toggleOff with bg hue tint (light mode: medium lightness)', () => {
    const light = applyDerivations(cyprusPrimaries, 'light');
    const [, , toggleL] = hexToHsl(light.colors.toggleOff);
    expect(toggleL).toBeGreaterThan(50);
    expect(toggleL).toBeLessThan(75);
  });
  it('toggleOff preserves bg hue', () => {
    const [bgH] = hexToHsl(cyprusPrimaries.bg);
    const [toggleH] = hexToHsl(derived.colors.toggleOff);
    expect(Math.abs(bgH - toggleH)).toBeLessThan(5);
  });
});
