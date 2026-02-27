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
    borderDefault: shiftLightness(p.bg, 8 * dir),

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
