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
