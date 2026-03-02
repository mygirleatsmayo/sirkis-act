// src/__tests__/derivationRules.test.ts
import { describe, it, expect } from 'vitest';
import { applyDerivations, extractPrimaries, getModeStatics } from '../themes/derivationRules';
import type { Primaries } from '../themes/derivationRules';
import { cyprusTheme } from '../themes/cyprus';
import { hexToRgb, hexToHsl } from '../utils/colorMath';

const cyprusPrimaries: Primaries = {
  bg: '#003D3A',
  brand: '#00A499',
  brandAccent: '#E6C300',
  returns: '#E6C300',
  loss: '#E65C5C',
  startNow: '#5CE6E6',
  opm: '#74c365',
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

  // ── returns derivations ──
  it('derives returnsBg as returns at alpha 0.08', () => {
    expect(derived.colors.returnsBg).toBe(cyprusTheme.colors.returnsBg);
  });
  it('derives heroLine2Color as copy of brandAccent', () => {
    expect(derived.heroLine2Color).toBe(cyprusPrimaries.brandAccent);
  });
  it('derives glowColors from brandAccent at correct alphas', () => {
    expect(normalizeRgba(derived.glowColors[0])).toBe(normalizeRgba(cyprusTheme.effects.glowColors[0]));
    expect(normalizeRgba(derived.glowColors[1])).toBe(normalizeRgba(cyprusTheme.effects.glowColors[1]));
    expect(normalizeRgba(derived.glowColors[2])).toBe(normalizeRgba(cyprusTheme.effects.glowColors[2]));
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

  // ── brandAccent derivations ──
  it('derives brandAccentBg as brandAccent at alpha 0.08', () => {
    expect(derived.colors.brandAccentBg).toBe(cyprusTheme.colors.brandAccentBg);
  });

  // ── primaries pass through ──
  it('includes primaries in output colors', () => {
    expect(derived.colors.bg).toBe(cyprusPrimaries.bg);
    expect(derived.colors.brand).toBe(cyprusPrimaries.brand);
    expect(derived.colors.returns).toBe(cyprusPrimaries.returns);
    expect(derived.colors.loss).toBe(cyprusPrimaries.loss);
    expect(derived.colors.startNow).toBe(cyprusPrimaries.startNow);
  });
});

describe('getModeStatics', () => {
  it('returns dark statics', () => {
    const dark = getModeStatics('dark');
    expect(dark.textPrimary).toBe('#ffffff');
    expect(dark.textSecondary).toBe('#e2e8f0');
    expect(dark.textNeutral).toBe('#e2e8f0');
    expect(dark.textSubtle).toBe('#94a3b8');
    expect(dark.borderSubtle).toBe('rgba(255, 255, 255, 0.06)');
    expect(dark.toggleOff).toBe('#cbd5e1');
    expect(dark.scrollbarThumb).toBe('rgba(148, 163, 184, 0.3)');
    expect(dark.scrollbarThumbHover).toBe('rgba(148, 163, 184, 0.5)');
    expect(dark.bgOverlay).toBe('rgba(15, 23, 42, 0.4)');
  });
  it('returns light statics with inverted text', () => {
    const light = getModeStatics('light');
    expect(light.textPrimary).toBe('#0f172a');
    expect(light.textSecondary).toBe('#334155');
    expect(light.textNeutral).toBe('#334155');
    expect(light.textSubtle).toBe('#475569');
    expect(light.borderSubtle).toBe('rgba(0, 0, 0, 0.06)');
    expect(light.toggleOff).toBe('#94a3b8');
    expect(light.scrollbarThumb).toBe('rgba(100, 116, 139, 0.3)');
    expect(light.scrollbarThumbHover).toBe('rgba(100, 116, 139, 0.5)');
  });
});
