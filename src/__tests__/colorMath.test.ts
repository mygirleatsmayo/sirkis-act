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
  it('analogous count 1 returns base color only', () => {
    const colors = analogous('#ff0000', 1);
    expect(colors).toEqual(['#ff0000']);
  });
  it('analogous count 0 returns base color only', () => {
    const colors = analogous('#00A499', 0);
    expect(colors).toEqual(['#00a499']);
  });
});
