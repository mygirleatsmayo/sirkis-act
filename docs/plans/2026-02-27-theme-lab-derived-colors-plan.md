# Theme Lab Derived Colors — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Auto-derive secondary color tokens from primary theme colors in Theme Lab, with per-token unlock for manual override.

**Architecture:** A static derivation rule map (`derivationRules.ts`) defines how each derived token relates to its primary (alpha, lightness shift, or copy). A pure color math utility (`colorMath.ts`) handles all HSL/RGB/alpha conversions. Theme Lab replaces its Color Families UI with a Primaries section that drives derivation, with lock/unlock per derived token.

**Tech Stack:** React 19, TypeScript strict, Vitest, Tailwind CSS, Lucide React icons

---

### Task 1: Color Math Utility — Tests

**Files:**
- Create: `src/utils/colorMath.ts` (empty stub with type exports)
- Create: `src/__tests__/colorMath.test.ts`

**Step 1: Create empty stub**

```ts
// src/utils/colorMath.ts

/** Convert hex (#RRGGBB) to RGB tuple */
export const hexToRgb = (_hex: string): [number, number, number] => [0, 0, 0];

/** Convert RGB tuple to hex (#rrggbb) */
export const rgbToHex = (_r: number, _g: number, _b: number): string => '#000000';

/** Convert RGB to HSL (h: 0-360, s: 0-100, l: 0-100) */
export const rgbToHsl = (_r: number, _g: number, _b: number): [number, number, number] => [0, 0, 0];

/** Convert HSL to RGB */
export const hslToRgb = (_h: number, _s: number, _l: number): [number, number, number] => [0, 0, 0];

/** Convert hex to HSL */
export const hexToHsl = (_hex: string): [number, number, number] => [0, 0, 0];

/** Convert HSL to hex */
export const hslToHex = (_h: number, _s: number, _l: number): string => '#000000';

/** Shift lightness of a hex color by delta percentage points (clamped 0-100) */
export const shiftLightness = (_hex: string, _delta: number): string => '#000000';

/** Create rgba string from hex + alpha */
export const hexToRgba = (_hex: string, _alpha: number): string => 'rgba(0,0,0,0)';

/** Relative luminance per WCAG 2.1 (0 = black, 1 = white) */
export const relativeLuminance = (_hex: string): number => 0;

// ─── Harmony stubs (pure functions, no UI) ──────────────────────────────

/** Analogous colors: ±30° hue rotation */
export const analogous = (_hex: string, _count?: number): string[] => [];

/** Triadic colors: ±120° hue rotation */
export const triadic = (_hex: string): [string, string, string] => ['#000', '#000', '#000'];

/** Tetradic colors: 90° intervals */
export const tetradic = (_hex: string): [string, string, string, string] => ['#000', '#000', '#000', '#000'];

/** Complementary color: 180° hue rotation */
export const complementary = (_hex: string): string => '#000000';
```

**Step 2: Write failing tests**

```ts
// src/__tests__/colorMath.test.ts
import { describe, it, expect } from 'vitest';
import {
  hexToRgb, rgbToHex, rgbToHsl, hslToRgb,
  hexToHsl, hslToHex, shiftLightness, hexToRgba,
  relativeLuminance, analogous, triadic, tetradic, complementary,
} from '../utils/colorMath';

describe('hexToRgb', () => {
  it('converts black', () => {
    expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
  });
  it('converts white', () => {
    expect(hexToRgb('#ffffff')).toEqual([255, 255, 255]);
  });
  it('converts Cyprus bg', () => {
    expect(hexToRgb('#003D3A')).toEqual([0, 61, 58]);
  });
  it('is case-insensitive', () => {
    expect(hexToRgb('#00a499')).toEqual([0, 164, 153]);
  });
});

describe('rgbToHex', () => {
  it('converts black', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
  });
  it('converts white', () => {
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
  });
  it('clamps out-of-range values', () => {
    expect(rgbToHex(300, -5, 128)).toBe('#ff0080');
  });
});

describe('rgbToHsl / hslToRgb roundtrip', () => {
  const cases: [number, number, number][] = [
    [0, 0, 0],       // black
    [255, 255, 255], // white
    [255, 0, 0],     // red
    [0, 164, 153],   // brand #00A499
    [0, 61, 58],     // bg #003D3A
    [230, 195, 0],   // returns #E6C300
    [211, 47, 47],   // loss #D32F2F
  ];
  cases.forEach(([r, g, b]) => {
    it(`roundtrips rgb(${r},${g},${b})`, () => {
      const [h, s, l] = rgbToHsl(r, g, b);
      const [r2, g2, b2] = hslToRgb(h, s, l);
      expect(r2).toBeCloseTo(r, 0);
      expect(g2).toBeCloseTo(g, 0);
      expect(b2).toBeCloseTo(b, 0);
    });
  });
});

describe('hexToHsl / hslToHex roundtrip', () => {
  const hexes = ['#003D3A', '#00A499', '#E6C300', '#D32F2F', '#0D9488', '#A8A8A8'];
  hexes.forEach(hex => {
    it(`roundtrips ${hex}`, () => {
      const [h, s, l] = hexToHsl(hex);
      const result = hslToHex(h, s, l);
      // Allow ±1 per channel due to rounding
      const [r1, g1, b1] = hexToRgb(hex.toLowerCase());
      const [r2, g2, b2] = hexToRgb(result);
      expect(Math.abs(r1 - r2)).toBeLessThanOrEqual(1);
      expect(Math.abs(g1 - g2)).toBeLessThanOrEqual(1);
      expect(Math.abs(b1 - b2)).toBeLessThanOrEqual(1);
    });
  });
});

describe('shiftLightness', () => {
  it('increases lightness', () => {
    const result = shiftLightness('#003D3A', 2);
    const [, , l1] = hexToHsl('#003D3A');
    const [, , l2] = hexToHsl(result);
    expect(l2).toBeCloseTo(l1 + 2, 0);
  });
  it('decreases lightness', () => {
    const result = shiftLightness('#003D3A', -3);
    const [, , l1] = hexToHsl('#003D3A');
    const [, , l2] = hexToHsl(result);
    expect(l2).toBeCloseTo(l1 - 3, 0);
  });
  it('clamps at 0', () => {
    const result = shiftLightness('#000000', -10);
    const [, , l] = hexToHsl(result);
    expect(l).toBe(0);
  });
  it('clamps at 100', () => {
    const result = shiftLightness('#ffffff', 10);
    const [, , l] = hexToHsl(result);
    expect(l).toBe(100);
  });
});

describe('hexToRgba', () => {
  it('creates rgba from brand hex', () => {
    expect(hexToRgba('#00A499', 0.06)).toBe('rgba(0, 164, 153, 0.06)');
  });
  it('creates rgba from loss hex', () => {
    expect(hexToRgba('#D32F2F', 0.07)).toBe('rgba(211, 47, 47, 0.07)');
  });
  it('handles alpha 1', () => {
    expect(hexToRgba('#003D3A', 1)).toBe('rgba(0, 61, 58, 1)');
  });
});

describe('relativeLuminance', () => {
  it('returns 0 for black', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 4);
  });
  it('returns 1 for white', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 4);
  });
  it('Cyprus bg is dark (< 0.1)', () => {
    expect(relativeLuminance('#003D3A')).toBeLessThan(0.1);
  });
});

describe('harmony functions', () => {
  it('complementary rotates 180°', () => {
    const comp = complementary('#ff0000');
    const [h] = hexToHsl(comp);
    expect(h).toBeCloseTo(180, 0);
  });
  it('triadic returns 3 colors at 120° intervals', () => {
    const [a, b, c] = triadic('#ff0000');
    const [ha] = hexToHsl(a);
    const [hb] = hexToHsl(b);
    const [hc] = hexToHsl(c);
    expect(ha).toBeCloseTo(0, 0);
    expect(hb).toBeCloseTo(120, 0);
    expect(hc).toBeCloseTo(240, 0);
  });
  it('tetradic returns 4 colors at 90° intervals', () => {
    const colors = tetradic('#ff0000');
    expect(colors).toHaveLength(4);
    const hues = colors.map(c => hexToHsl(c)[0]);
    expect(hues[0]).toBeCloseTo(0, 0);
    expect(hues[1]).toBeCloseTo(90, 0);
    expect(hues[2]).toBeCloseTo(180, 0);
    expect(hues[3]).toBeCloseTo(270, 0);
  });
  it('analogous returns requested count', () => {
    const colors = analogous('#ff0000', 5);
    expect(colors).toHaveLength(5);
  });
  it('analogous default count is 3', () => {
    const colors = analogous('#ff0000');
    expect(colors).toHaveLength(3);
  });
});
```

**Step 3: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/colorMath.test.ts`
Expected: All tests FAIL (stub implementations return wrong values)

**Step 4: Commit stubs and tests**

```bash
git add src/utils/colorMath.ts src/__tests__/colorMath.test.ts
git commit -m "test: add colorMath test suite with stubs (all failing)"
```

---

### Task 2: Color Math Utility — Implementation

**Files:**
- Modify: `src/utils/colorMath.ts`

**Step 1: Implement all functions**

```ts
// src/utils/colorMath.ts

/** Convert hex (#RRGGBB) to RGB tuple */
export const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.toLowerCase();
  return [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
};

/** Convert RGB tuple to hex (#rrggbb) */
export const rgbToHex = (r: number, g: number, b: number): string =>
  '#' + [r, g, b]
    .map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0'))
    .join('');

/** Convert RGB to HSL (h: 0-360, s: 0-100, l: 0-100) */
export const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  const d = max - min;
  const l = (max + min) / 2;

  if (d === 0) return [0, 0, l * 100];

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rN) h = ((gN - bN) / d + (gN < bN ? 6 : 0)) / 6;
  else if (max === gN) h = ((bN - rN) / d + 2) / 6;
  else h = ((rN - gN) / d + 4) / 6;

  return [h * 360, s * 100, l * 100];
};

/** Convert HSL to RGB */
export const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  const sN = s / 100;
  const lN = l / 100;

  if (sN === 0) {
    const v = Math.round(lN * 255);
    return [v, v, v];
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    let tN = t;
    if (tN < 0) tN += 1;
    if (tN > 1) tN -= 1;
    if (tN < 1 / 6) return p + (q - p) * 6 * tN;
    if (tN < 1 / 2) return q;
    if (tN < 2 / 3) return p + (q - p) * (2 / 3 - tN) * 6;
    return p;
  };

  const q = lN < 0.5 ? lN * (1 + sN) : lN + sN - lN * sN;
  const p = 2 * lN - q;
  const hN = h / 360;

  return [
    Math.round(hue2rgb(p, q, hN + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, hN) * 255),
    Math.round(hue2rgb(p, q, hN - 1 / 3) * 255),
  ];
};

/** Convert hex to HSL */
export const hexToHsl = (hex: string): [number, number, number] => {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHsl(r, g, b);
};

/** Convert HSL to hex */
export const hslToHex = (h: number, s: number, l: number): string => {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
};

/** Shift lightness of a hex color by delta percentage points (clamped 0-100) */
export const shiftLightness = (hex: string, delta: number): string => {
  const [h, s, l] = hexToHsl(hex);
  const newL = Math.max(0, Math.min(100, l + delta));
  return hslToHex(h, s, newL);
};

/** Create rgba string from hex + alpha */
export const hexToRgba = (hex: string, alpha: number): string => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/** Relative luminance per WCAG 2.1 (0 = black, 1 = white) */
export const relativeLuminance = (hex: string): number => {
  const [r, g, b] = hexToRgb(hex);
  const toLinear = (c: number): number => {
    const sRGB = c / 255;
    return sRGB <= 0.04045 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
};

// ─── Harmony (pure functions, no UI) ────────────────────────────────────

const rotateHue = (hex: string, degrees: number): string => {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex((h + degrees + 360) % 360, s, l);
};

/** Analogous colors: evenly spaced around ±30° */
export const analogous = (hex: string, count = 3): string[] => {
  const spread = 60; // total spread in degrees
  const step = spread / (count - 1);
  const start = -(spread / 2);
  return Array.from({ length: count }, (_, i) => rotateHue(hex, start + step * i));
};

/** Triadic colors: 0°, 120°, 240° */
export const triadic = (hex: string): [string, string, string] => [
  hex.toLowerCase().slice(0, 7),
  rotateHue(hex, 120),
  rotateHue(hex, 240),
];

/** Tetradic colors: 0°, 90°, 180°, 270° */
export const tetradic = (hex: string): [string, string, string, string] => [
  hex.toLowerCase().slice(0, 7),
  rotateHue(hex, 90),
  rotateHue(hex, 180),
  rotateHue(hex, 270),
];

/** Complementary color: 180° hue rotation */
export const complementary = (hex: string): string => rotateHue(hex, 180);
```

**Step 2: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/colorMath.test.ts`
Expected: All tests PASS

**Step 3: Run full test suite to check nothing broke**

Run: `npx vitest run`
Expected: All tests PASS

**Step 4: Commit**

```bash
git add src/utils/colorMath.ts
git commit -m "feat: implement colorMath utility with HSL, alpha, luminance, and harmony functions"
```

---

### Task 3: Derivation Rules — Tests

**Files:**
- Create: `src/themes/derivationRules.ts` (empty stub)
- Create: `src/__tests__/derivationRules.test.ts`

**Step 1: Create stub**

```ts
// src/themes/derivationRules.ts
import type { ThemeColors } from './types';

export type ThemeMode = 'dark' | 'light';

export interface Primaries {
  bg: string;
  brand: string;
  returns: string;
  loss: string;
  startNow: string;
  opm: string;
}

export interface DerivedColors {
  colors: ThemeColors;
  heroLine1Color: string;
  heroLine2Color: string;
  glowColors: [string, string, string];
  blobColors: [string, string];
}

/** Extract the 6 primaries from a ThemeConfig's colors */
export const extractPrimaries = (_colors: ThemeColors): Primaries => ({
  bg: '', brand: '', returns: '', loss: '', startNow: '', opm: '',
});

/** Derive all secondary tokens from primaries + mode */
export const applyDerivations = (_primaries: Primaries, _mode: ThemeMode): DerivedColors =>
  ({} as DerivedColors);

/** Get mode-dependent static values */
export const getModeStatics = (_mode: ThemeMode): Partial<ThemeColors> => ({});
```

**Step 2: Write failing tests**

```ts
// src/__tests__/derivationRules.test.ts
import { describe, it, expect } from 'vitest';
import { applyDerivations, extractPrimaries, getModeStatics } from '../themes/derivationRules';
import type { Primaries } from '../themes/derivationRules';
import { cyprusTheme } from '../themes/cyprus';

const cyprusPrimaries: Primaries = {
  bg: '#003D3A',
  brand: '#00A499',
  returns: '#E6C300',
  loss: '#D32F2F',
  startNow: '#0D9488',
  opm: '#A8A8A8',
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
    expect(derived.colors.bgGlass).toBe(cyprusTheme.colors.bgGlass);
  });
  it('derives bgCard as bg +1% lightness', () => {
    expect(derived.colors.bgCard).toBe(cyprusTheme.colors.bgCard);
  });
  it('derives bgInput as bg -3% lightness', () => {
    expect(derived.colors.bgInput).toBe(cyprusTheme.colors.bgInput);
  });
  it('derives bgMuted as bg at alpha 0.6', () => {
    expect(derived.colors.bgMuted).toBe(cyprusTheme.colors.bgMuted);
  });
  it('derives borderDefault as bg +12% lightness', () => {
    expect(derived.colors.borderDefault).toBe(cyprusTheme.colors.borderDefault);
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
    expect(derived.colors.sliderAccentHover).toBe(cyprusTheme.colors.sliderAccentHover);
  });
  it('derives heroLine1Color as copy of brand', () => {
    expect(derived.heroLine1Color).toBe(cyprusPrimaries.brand);
  });

  // ── returns derivations ──
  it('derives returnsBg as returns at alpha 0.08', () => {
    expect(derived.colors.returnsBg).toBe(cyprusTheme.colors.returnsBg);
  });
  it('derives heroLine2Color as copy of returns', () => {
    expect(derived.heroLine2Color).toBe(cyprusPrimaries.returns);
  });
  it('derives glowColors from returns', () => {
    expect(derived.glowColors[0]).toBe(cyprusTheme.effects.glowColors[0]);
    expect(derived.glowColors[1]).toBe(cyprusTheme.effects.glowColors[1]);
    expect(derived.glowColors[2]).toBe(cyprusTheme.effects.glowColors[2]);
  });
  it('derives blobColors from returns', () => {
    expect(derived.blobColors[0]).toBe(cyprusTheme.effects.blobs[0].color);
    expect(derived.blobColors[1]).toBe(cyprusTheme.effects.blobs[1].color);
  });

  // ── loss derivation ──
  it('derives lossBg as loss at alpha 0.07', () => {
    expect(derived.colors.lossBg).toBe(cyprusTheme.colors.lossBg);
  });

  // ── startNow derivation ──
  it('derives startNowBg as startNow at alpha 0.08', () => {
    expect(derived.colors.startNowBg).toBe(cyprusTheme.colors.startNowBg);
  });

  // ── opm passthrough ──
  it('passes opm through unchanged', () => {
    expect(derived.colors.opm).toBe(cyprusPrimaries.opm);
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
    expect(dark.textMuted).toBe('#cbd5e1');
    expect(dark.textSubtle).toBe('#94a3b8');
    expect(dark.textOnBrand).toBe('#ffffff');
    expect(dark.borderSubtle).toBe('rgba(255, 255, 255, 0.06)');
    expect(dark.neutral).toBe('rgba(255, 255, 255, 0.10)');
    expect(dark.toggleOff).toBe('#cbd5e1');
    expect(dark.scrollbarThumb).toBe('rgba(148, 163, 184, 0.3)');
    expect(dark.scrollbarThumbHover).toBe('rgba(148, 163, 184, 0.5)');
    expect(dark.bgOverlay).toBe('rgba(15, 23, 42, 0.4)');
  });
  it('returns light statics with inverted text', () => {
    const light = getModeStatics('light');
    expect(light.textPrimary).toBe('#0f172a');
    expect(light.textSecondary).toBe('#334155');
    expect(light.textMuted).toBe('#64748b');
    expect(light.textSubtle).toBe('#475569');
    expect(light.textOnBrand).toBe('#ffffff');
    expect(light.borderSubtle).toBe('rgba(0, 0, 0, 0.06)');
    expect(light.neutral).toBe('rgba(0, 0, 0, 0.10)');
    expect(light.toggleOff).toBe('#94a3b8');
    expect(light.scrollbarThumb).toBe('rgba(100, 116, 139, 0.3)');
    expect(light.scrollbarThumbHover).toBe('rgba(100, 116, 139, 0.5)');
  });
});
```

**Step 3: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/derivationRules.test.ts`
Expected: All tests FAIL

**Step 4: Commit**

```bash
git add src/themes/derivationRules.ts src/__tests__/derivationRules.test.ts
git commit -m "test: add derivationRules test suite with stubs (all failing)"
```

---

### Task 4: Derivation Rules — Implementation

**Files:**
- Modify: `src/themes/derivationRules.ts`

**Step 1: Implement all functions**

```ts
// src/themes/derivationRules.ts
import type { ThemeColors } from './types';
import { shiftLightness, hexToRgba } from '../utils/colorMath';

export type ThemeMode = 'dark' | 'light';

export interface Primaries {
  bg: string;
  brand: string;
  returns: string;
  loss: string;
  startNow: string;
  opm: string;
}

export interface DerivedColors {
  colors: ThemeColors;
  heroLine1Color: string;
  heroLine2Color: string;
  glowColors: [string, string, string];
  blobColors: [string, string];
}

/** Extract the 6 primaries from a ThemeConfig's colors */
export const extractPrimaries = (colors: ThemeColors): Primaries => ({
  bg: colors.bg,
  brand: colors.brand,
  returns: colors.returns,
  loss: colors.loss,
  startNow: colors.startNow,
  opm: colors.opm,
});

const DARK_STATICS: Partial<ThemeColors> = {
  bgOverlay: 'rgba(15, 23, 42, 0.4)',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  textPrimary: '#ffffff',
  textSecondary: '#e2e8f0',
  textMuted: '#cbd5e1',
  textSubtle: '#94a3b8',
  textOnBrand: '#ffffff',
  neutral: 'rgba(255, 255, 255, 0.10)',
  toggleOff: '#cbd5e1',
  scrollbarThumb: 'rgba(148, 163, 184, 0.3)',
  scrollbarThumbHover: 'rgba(148, 163, 184, 0.5)',
};

const LIGHT_STATICS: Partial<ThemeColors> = {
  bgOverlay: 'rgba(15, 23, 42, 0.4)',
  borderSubtle: 'rgba(0, 0, 0, 0.06)',
  textPrimary: '#0f172a',
  textSecondary: '#334155',
  textMuted: '#64748b',
  textSubtle: '#475569',
  textOnBrand: '#ffffff',
  neutral: 'rgba(0, 0, 0, 0.10)',
  toggleOff: '#94a3b8',
  scrollbarThumb: 'rgba(100, 116, 139, 0.3)',
  scrollbarThumbHover: 'rgba(100, 116, 139, 0.5)',
};

/** Get mode-dependent static values */
export const getModeStatics = (mode: ThemeMode): Partial<ThemeColors> =>
  mode === 'dark' ? { ...DARK_STATICS } : { ...LIGHT_STATICS };

/** Derive all secondary tokens from primaries + mode.
 *  Lightness shifts flip direction for light mode. */
export const applyDerivations = (p: Primaries, mode: ThemeMode): DerivedColors => {
  const dir = mode === 'dark' ? 1 : -1;
  const statics = getModeStatics(mode);

  const colors: ThemeColors = {
    // Primaries
    bg: p.bg,
    brand: p.brand,
    returns: p.returns,
    loss: p.loss,
    startNow: p.startNow,
    opm: p.opm,

    // bg derivations
    bgGlass: shiftLightness(p.bg, 2 * dir),
    bgCard: shiftLightness(p.bg, 1 * dir),
    bgInput: shiftLightness(p.bg, -3 * dir),
    bgMuted: hexToRgba(p.bg, 0.6),
    borderDefault: shiftLightness(p.bg, 12 * dir),

    // brand derivations
    brandBg: hexToRgba(p.brand, 0.06),
    focusRing: p.brand,
    sliderAccent: p.brand,
    sliderAccentHover: shiftLightness(p.brand, -5 * dir),

    // returns derivation
    returnsBg: hexToRgba(p.returns, 0.08),

    // loss derivation
    lossBg: hexToRgba(p.loss, 0.07),

    // startNow derivation
    startNowBg: hexToRgba(p.startNow, 0.08),

    // mode-dependent statics
    bgOverlay: statics.bgOverlay!,
    borderSubtle: statics.borderSubtle!,
    textPrimary: statics.textPrimary!,
    textSecondary: statics.textSecondary!,
    textMuted: statics.textMuted!,
    textSubtle: statics.textSubtle!,
    textOnBrand: statics.textOnBrand!,
    neutral: statics.neutral!,
    toggleOff: statics.toggleOff!,
    scrollbarThumb: statics.scrollbarThumb!,
    scrollbarThumbHover: statics.scrollbarThumbHover!,
  };

  return {
    colors,
    heroLine1Color: p.brand,
    heroLine2Color: p.returns,
    glowColors: [
      hexToRgba(p.returns, 0.50),
      hexToRgba(p.returns, 0.32),
      hexToRgba(p.returns, 0.20),
    ],
    blobColors: [
      hexToRgba(p.returns, 0.10),
      hexToRgba(p.returns, 0.05),
    ],
  };
};
```

**Step 2: Run derivation tests**

Run: `npx vitest run src/__tests__/derivationRules.test.ts`
Expected: All tests PASS (or near-pass; some lightness-derived hex values may be ±1 channel off due to HSL rounding — adjust test expectations if needed to use `closeTo` comparisons for lightness-shifted tokens)

**Step 3: Run full test suite**

Run: `npx vitest run`
Expected: All tests PASS

**Step 4: Commit**

```bash
git add src/themes/derivationRules.ts
git commit -m "feat: implement derivation rules engine with mode-dependent statics"
```

---

### Task 5: Migrate ThemeLab Color Helpers to colorMath

**Files:**
- Modify: `src/ThemeLab.tsx` (lines 10-30 — remove `parseRgba`, `hexToRgb`, `rgbToHex`, `toHex`)
- Modify: `src/utils/colorMath.ts` (add `parseRgba` and `toHex` if not present)

ThemeLab currently has its own `parseRgba`, `hexToRgb`, `rgbToHex`, and `toHex` helpers (lines 10-30). These overlap with `colorMath.ts`. This task moves them to the shared utility and updates ThemeLab imports.

**Step 1: Add `parseRgba` and `toHex` to colorMath.ts**

Add to the end of `src/utils/colorMath.ts`:

```ts
/** Parse an rgba/rgb() string into [r, g, b, a] or null if invalid */
export const parseRgba = (s: string): [number, number, number, number] | null => {
  const m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (!m) return null;
  return [+m[1], +m[2], +m[3], m[4] != null ? +m[4] : 1];
};

/** Convert any color string (hex or rgba) to a 7-char lowercase hex */
export const toHex = (color: string): string => {
  if (color.startsWith('#')) return color.slice(0, 7).toLowerCase();
  const rgba = parseRgba(color);
  if (rgba) return rgbToHex(rgba[0], rgba[1], rgba[2]);
  return '#888888';
};
```

**Step 2: Update ThemeLab imports**

In `src/ThemeLab.tsx`, replace lines 10-30 (the local helper functions) with:

```ts
import { hexToRgb, rgbToHex, parseRgba, toHex } from './utils/colorMath';
```

Keep the remaining local helpers (`camelToLabel`, `sanitizeSvg`, `prepareSvgHtml`, `cloneTheme`, `getNested`, `setNested`) as they are ThemeLab-specific.

**Step 3: Run full test suite**

Run: `npx vitest run`
Expected: All tests PASS

**Step 4: Run build and lint**

Run: `npm run build && npm run lint`
Expected: Both pass (zero warnings)

**Step 5: Commit**

```bash
git add src/utils/colorMath.ts src/ThemeLab.tsx
git commit -m "refactor: move shared color helpers from ThemeLab to colorMath utility"
```

---

### Task 6: Theme Lab — Primaries Section + Lock/Unlock State

**Files:**
- Modify: `src/ThemeLab.tsx`

This is the core UX change. Replace the Color Families section (lines 686-722) with a Primaries section. Add per-token lock/unlock state for derived tokens. Add dark/light/auto toggle.

**Step 1: Add derivation imports and lock state**

At top of `ThemeLab.tsx`, add import:

```ts
import { Lock, Unlock, Sun, Moon, Zap } from 'lucide-react';
import { applyDerivations, extractPrimaries, getModeStatics } from './themes/derivationRules';
import type { Primaries, ThemeMode } from './themes/derivationRules';
import { relativeLuminance } from './utils/colorMath';
```

Inside the `ThemeLab` component, after the existing state declarations, add:

```ts
// Dark/Light/Auto mode
const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'auto'>('dark');

// Per-token lock state: key = dot-path of derived token, value = locked (true) or unlocked (false)
// All derived tokens start locked
const [tokenLocks, setTokenLocks] = useState<Record<string, boolean>>(() => ({}));
// Empty record = all locked (absence means locked; only unlocked tokens are stored as false)

const isTokenLocked = useCallback((path: string): boolean => {
  return tokenLocks[path] !== false;
}, [tokenLocks]);

const unlockToken = useCallback((path: string) => {
  setTokenLocks(prev => ({ ...prev, [path]: false }));
}, []);

const relockToken = useCallback((path: string) => {
  setTokenLocks(prev => {
    const next = { ...prev };
    delete next[path];
    return next;
  });
}, []);

// Compute effective mode for derivations
const effectiveMode: ThemeMode = useMemo(() => {
  if (themeMode === 'auto') {
    return relativeLuminance(theme.colors.bg) >= 0.5 ? 'light' : 'dark';
  }
  return themeMode;
}, [themeMode, theme.colors.bg]);
```

**Step 2: Add primary change handler that auto-derives locked tokens**

```ts
/** Change a primary color and auto-update all locked derived tokens */
const setPrimaryColor = useCallback((primaryKey: keyof Primaries, newHex: string) => {
  setThemeLocal(prev => {
    const next = cloneTheme(prev);
    // Update the primary itself
    if (primaryKey === 'opm') {
      next.colors.opm = newHex;
      return next;
    }

    // Set primary in colors
    (next.colors as Record<string, string>)[primaryKey] = newHex;

    // Build updated primaries and derive
    const primaries = extractPrimaries(next.colors);
    const derived = applyDerivations(primaries, effectiveMode);

    // Apply derived values only to LOCKED tokens
    // colors
    for (const [key, value] of Object.entries(derived.colors)) {
      const path = `colors.${key}`;
      // Skip primaries themselves and opm
      if (['bg', 'brand', 'returns', 'loss', 'startNow', 'opm'].includes(key)) continue;
      if (isTokenLocked(path)) {
        (next.colors as Record<string, string>)[key] = value;
      }
    }

    // branding colors
    if (isTokenLocked('branding.heroLine1Color')) {
      next.branding.heroLine1Color = derived.heroLine1Color;
    }
    if (isTokenLocked('branding.heroLine2Color')) {
      next.branding.heroLine2Color = derived.heroLine2Color;
    }

    // glow colors
    derived.glowColors.forEach((gc, i) => {
      if (isTokenLocked(`effects.glowColors.${i}`)) {
        next.effects.glowColors[i] = gc;
      }
    });

    // blob colors
    derived.blobColors.forEach((bc, i) => {
      if (isTokenLocked(`effects.blobs.${i}.color`)) {
        next.effects.blobs[i] = { ...next.effects.blobs[i], color: bc };
      }
    });

    // mode-dependent statics
    const statics = getModeStatics(effectiveMode);
    for (const [key, value] of Object.entries(statics)) {
      const path = `colors.${key}`;
      if (isTokenLocked(path)) {
        (next.colors as Record<string, string>)[key] = value as string;
      }
    }

    return next;
  });
}, [effectiveMode, isTokenLocked]);
```

**Step 3: Replace Color Families UI with Primaries section**

Replace the Color Families section in the JSX (the `{families.map(family => ...)}` block, approximately lines 686-722) with:

```tsx
{/* ── Primaries ── */}
<SectionHeader label="Primaries" />
<div className="text-[9px] text-white/30 -mt-1 mb-2">
  Set primary colors. Derived tokens auto-update unless unlocked.
</div>

{/* Mode toggle */}
<div className="flex items-center gap-1 mb-3 p-1 rounded-lg bg-white/5 w-fit">
  {([
    { mode: 'dark' as const, icon: Moon, label: 'Dark' },
    { mode: 'light' as const, icon: Sun, label: 'Light' },
    { mode: 'auto' as const, icon: Zap, label: 'Auto' },
  ]).map(({ mode, icon: Icon, label }) => (
    <button
      key={mode}
      type="button"
      onClick={() => setThemeMode(mode)}
      className={`flex items-center gap-1 px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-md transition-colors ${
        themeMode === mode
          ? 'bg-white/15 text-white'
          : 'text-white/40 hover:text-white/60'
      }`}
    >
      <Icon size={10} /> {label}
    </button>
  ))}
</div>

{/* Primary color pickers */}
{(['bg', 'brand', 'returns', 'loss', 'startNow', 'opm'] as const).map(key => {
  const derivedCount = key === 'opm' ? 0
    : key === 'bg' ? 5
    : key === 'brand' ? 5
    : key === 'returns' ? 7
    : key === 'loss' ? 1
    : 1; // startNow
  return (
    <div key={key} className="flex items-center gap-1.5 py-0.5">
      <input
        type="color"
        value={toHex(theme.colors[key])}
        onChange={(e) => setPrimaryColor(key, e.target.value)}
        className="w-6 h-6 rounded border border-white/20 cursor-pointer bg-transparent p-0 shrink-0"
      />
      <div className="flex-1 min-w-0 text-[10px] font-bold text-white/70 uppercase tracking-wider truncate leading-tight">
        {camelToLabel(key)}
      </div>
      {derivedCount > 0 && (
        <span className="text-[8px] text-white/25 tabular-nums">{derivedCount} derived</span>
      )}
      <button
        type="button"
        onClick={() => {
          const def = defaults.current;
          (setPrimaryColor as (k: keyof Primaries, v: string) => void)(key as keyof Primaries, def.colors[key]);
        }}
        className={`p-0.5 shrink-0 transition-colors ${
          theme.colors[key] === defaults.current.colors[key]
            ? 'text-white/[0.06] cursor-default'
            : 'text-white/30 hover:text-white/60'
        }`}
        title="Reset to default"
      >
        <RotateCcw size={10} />
      </button>
    </div>
  );
})}
```

**Step 4: Update Token Sections to show lock/unlock state**

Modify the `ColorInput` component to accept `locked` and `onUnlock` props. When locked, the color picker and hex input are dimmed and non-interactive. A small lock/unlock icon is shown.

Update `ColorInputProps`:

```ts
interface ColorInputProps {
  label: string;
  value: string;
  defaultValue: string;
  onChange: (hex: string) => void;
  familyHex?: string;
  locked?: boolean;
  onUnlock?: () => void;
  onRelock?: () => void;
}
```

Update the `ColorInput` component body to conditionally disable and show lock icon. See the design doc for full behavior: locked = dimmed + non-interactive + lock icon; unlock button activates editing; reset re-locks.

**Step 5: Update the reset handler to re-lock all tokens**

```ts
const handleReset = useCallback(() => {
  setThemeLocal(cloneTheme(playgroundTheme));
  setCustomSvg(null);
  setTokenLocks({});  // re-lock all
  setThemeMode('dark');
}, []);
```

**Step 6: Remove old family state and detection code**

Remove: `families` useMemo, `pathToFamily` useMemo, `familyLinks` state, `familyLinksRef`, `toggleFamilyLink`, `resetFamily`, `setFamilyColor`, `familyCurrentHex`, and the `detectFamilies`/`buildPathToFamily` functions at the top of the file (lines 73-121). Also remove `Link2`, `Unlink` from the Lucide imports if no longer used.

**Step 7: Run build and lint**

Run: `npm run build && npm run lint`
Expected: Both pass

**Step 8: Run full test suite**

Run: `npx vitest run`
Expected: All tests PASS

**Step 9: Commit**

```bash
git add src/ThemeLab.tsx
git commit -m "feat: replace Color Families with Primaries section and per-token lock/unlock"
```

---

### Task 7: Flash/Highlight Feature

**Files:**
- Modify: `src/ThemeLab.tsx`

**Step 1: Add flash utility function**

Inside `ThemeLab.tsx`, add a `flashToken` helper:

```ts
/** Temporarily flash a CSS variable to highlight which elements use it.
 *  Restores original value after 250ms. */
const flashToken = useCallback((path: string) => {
  const root = document.documentElement;
  const varName = pathToCssVar(path);
  if (!varName) return;

  const original = root.style.getPropertyValue(varName);
  root.style.setProperty(varName, '255 0 255'); // magenta flash for hex vars
  setTimeout(() => {
    root.style.setProperty(varName, original);
  }, 250);
}, []);

/** Map a dot-path to its CSS variable name (only for color tokens) */
const pathToCssVar = (path: string): string | null => {
  if (!path.startsWith('colors.')) return null;
  const key = path.replace('colors.', '');
  const kebab = key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
  return `--color-${kebab}`;
};
```

**Step 2: Wire flash to token label clicks**

In the `ColorInput` component, make the label clickable:

```tsx
<button
  type="button"
  onClick={() => onFlash?.()}
  className="flex-1 min-w-0 text-[10px] font-bold text-white/70 uppercase tracking-wider truncate leading-tight text-left hover:text-white/90 transition-colors cursor-pointer"
  title="Flash to preview"
>
  {label}
</button>
```

Add `onFlash?: () => void` to `ColorInputProps`.

**Step 3: For primaries, flash all locked derived tokens together**

When clicking a primary's label, call `flashToken` for the primary itself plus all its locked derived token paths.

**Step 4: Run build and lint**

Run: `npm run build && npm run lint`
Expected: Both pass

**Step 5: Commit**

```bash
git add src/ThemeLab.tsx
git commit -m "feat: add flash/highlight on token name click"
```

---

### Task 8: Final Verification

**Files:** None (verification only)

**Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests PASS

**Step 2: Run build**

Run: `npm run build`
Expected: Clean build, no errors

**Step 3: Run lint**

Run: `npm run lint`
Expected: Zero warnings

**Step 4: Manual smoke test**

Run: `npm run dev`

Verify:
- Theme Lab opens and shows Primaries section at top (bg, brand, returns, loss, startNow, opm)
- Dark/Light/Auto toggle visible and functional
- Changing brand color auto-updates brandBg, focusRing, sliderAccent, sliderAccentHover, heroLine1Color
- Changing returns auto-updates returnsBg, heroLine2Color, all 3 glow colors, both blob colors
- Changing bg auto-updates bgGlass, bgCard, bgInput, bgMuted, borderDefault
- Derived tokens show lock icon and are non-interactive
- Clicking unlock icon on a derived token enables editing
- Unlocked token does NOT update when primary changes
- Reset on unlocked token re-locks it and snaps to derived value
- Reset on primary resets primary + locked derived, not unlocked
- Full reset re-locks everything
- Clicking token name flashes associated elements
- Export still produces valid standalone theme file
- All existing Token Sections, Branding, Logo, Fonts, Effects still work

**Step 5: Commit any final fixes if needed**

```bash
git add -A
git commit -m "fix: final verification fixes for derived color system"
```
