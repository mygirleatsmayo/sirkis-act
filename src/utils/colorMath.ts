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

/** WCAG 2.1 contrast ratio between two hex colors (range 1–21) */
export const contrastRatio = (hex1: string, hex2: string): number => {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

/** Pick white or black for maximum contrast against a background hex color */
export const getContrastText = (bgHex: string): string =>
  relativeLuminance(bgHex) > 0.179 ? '#000000' : '#ffffff';

// ─── Parsing utilities ──────────────────────────────────────────────────

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

// ─── Harmony (pure functions, no UI) ────────────────────────────────────

const rotateHue = (hex: string, degrees: number): string => {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex((h + degrees + 360) % 360, s, l);
};

/** Analogous colors: evenly spaced around ±30° */
export const analogous = (hex: string, count = 3): string[] => {
  if (count <= 1) return [toHex(hex)];
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
