// src/themes/derivationRules.ts
import type { ThemeColors } from './types';
import { shiftLightness, hexToRgba } from '../utils/colorMath';

export type ThemeMode = 'dark' | 'light';

export interface Primaries {
  bg: string;
  brand: string;
  brandAccent: string;
  returns: string;
  loss: string;
  startNow: string;
  opm: string;
}

export interface DerivedColors {
  colors: ThemeColors;
  logoColor: string;
  heroLine1Color: string;
  heroLine2Color: string;
  glowColors: [string, string, string];
  blobColors: [string, string];
}

/** Extract the 6 primaries from a ThemeConfig's colors */
export const extractPrimaries = (colors: ThemeColors): Primaries => ({
  bg: colors.bg,
  brand: colors.brand,
  brandAccent: colors.brandAccent,
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
  textNeutral: '#e2e8f0',
  textSubtle: '#94a3b8',
  toggleOff: '#cbd5e1',
  scrollbarThumb: 'rgba(148, 163, 184, 0.3)',
  scrollbarThumbHover: 'rgba(148, 163, 184, 0.5)',
};

const LIGHT_STATICS: Partial<ThemeColors> = {
  bgOverlay: 'rgba(15, 23, 42, 0.4)',
  borderSubtle: 'rgba(0, 0, 0, 0.06)',
  textPrimary: '#0f172a',
  textSecondary: '#334155',
  textNeutral: '#334155',
  textSubtle: '#475569',
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
    brandAccent: p.brandAccent,
    returns: p.returns,
    loss: p.loss,
    startNow: p.startNow,
    opm: p.opm,

    // bg derivations
    bgGlass: shiftLightness(p.bg, 2 * dir),
    bgInput: shiftLightness(p.bg, -3 * dir),
    borderDefault: shiftLightness(p.bg, 8 * dir),

    // brand derivations
    brandBg: hexToRgba(p.brand, 0.06),
    focusRing: p.brand,
    sliderAccent: p.brand,
    sliderAccentHover: shiftLightness(p.brand, -5 * dir),

    // returns derivation
    returnsBg: hexToRgba(p.returns, 0.08),

    // brandAccent derivations
    brandAccentBg: hexToRgba(p.brandAccent, 0.08),

    // opm derivation
    opmBg: hexToRgba(p.opm, 0.08),

    // loss derivation
    lossBg: hexToRgba(p.loss, 0.07),

    // mode-dependent statics
    bgOverlay: statics.bgOverlay!,
    borderSubtle: statics.borderSubtle!,
    textPrimary: statics.textPrimary!,
    textSecondary: statics.textSecondary!,
    textNeutral: statics.textNeutral!,
    textSubtle: statics.textSubtle!,
    neutralBg: hexToRgba(statics.textNeutral!, 0.10),
    toggleOff: statics.toggleOff!,
    scrollbarThumb: statics.scrollbarThumb!,
    scrollbarThumbHover: statics.scrollbarThumbHover!,
  };

  return {
    colors,
    logoColor: p.brand,
    heroLine1Color: p.brand,
    heroLine2Color: p.brandAccent,
    glowColors: [
      hexToRgba(p.brandAccent, 0.50),
      hexToRgba(p.brandAccent, 0.32),
      hexToRgba(p.brandAccent, 0.20),
    ],
    blobColors: [
      hexToRgba(p.brandAccent, 0.10),
      hexToRgba(p.brandAccent, 0.05),
    ],
  };
};
