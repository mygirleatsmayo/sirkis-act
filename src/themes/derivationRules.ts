// src/themes/derivationRules.ts
import type { ThemeColors } from './types';
import { shiftLightness, hexToRgba, hexToHsl, hslToHex, relativeLuminance } from '../utils/colorMath';
// TODO: Revisit OKLCH-based derivation for textSubtle from textSecondary (perceptually uniform)
// HSL derivation produced inconsistent results across hues; both are standalone primaries for now.

export type ThemeMode = 'dark' | 'light';

export interface Primaries {
  bg: string;
  brand: string;
  brandAccent: string;
  returns: string;
  loss: string;
  startNow: string;
  opm: string;
  textPrimary: string;
  textSecondary: string;
  textSubtle: string;
  textNeutral: string;
  textOnBrand: string;
  target: string;
  selfFunded: string;
}

export interface DerivedColors {
  colors: ThemeColors;
  logoColor: string;
  heroLine1Color: string;
  heroLine2Color: string;
  glowColor: string;
  blobColors: [string, string];
}

/** Extract editable primaries from a ThemeConfig's colors */
export const extractPrimaries = (colors: ThemeColors): Primaries => ({
  bg: colors.bg,
  brand: colors.brand,
  brandAccent: colors.brandAccent,
  returns: colors.returns,
  loss: colors.loss,
  startNow: colors.startNow,
  opm: colors.opm,
  textPrimary: colors.textPrimary,
  textSecondary: colors.textSecondary,
  textSubtle: colors.textSubtle,
  textNeutral: colors.textNeutral,
  textOnBrand: colors.textOnBrand,
  target: colors.target,
  selfFunded: colors.selfFunded,
});

const DARK_STATICS: Partial<ThemeColors> = {
  scrollbarThumb: 'rgba(148, 163, 184, 0.3)',
  scrollbarThumbHover: 'rgba(148, 163, 184, 0.5)',
};

const LIGHT_STATICS: Partial<ThemeColors> = {
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
    textPrimary: p.textPrimary,
    textNeutral: p.textNeutral,

    // bg derivations
    bgGlass: shiftLightness(p.bg, 2 * dir),
    bgInput: shiftLightness(p.bg, -3 * dir),
    borderDefault: shiftLightness(p.bg, 8 * dir),

    // muted surface (darker than parent glass cards)
    mutedBg: mode === 'dark' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.04)',

    // text on brand (standalone — OKLCH derivation deferred)
    textOnBrand: p.textOnBrand,

    // brand derivations
    brandBg: hexToRgba(p.brand, 0.06),
    focusRing: p.brand,
    sliderAccent: p.brand,
    sliderAccentHover: shiftLightness(p.brand, -5 * dir),

    // projection primaries + derivations
    target: p.target,
    targetBg: hexToRgba(p.target, 0.06),
    selfFunded: p.selfFunded,
    selfFundedBg: hexToRgba(p.selfFunded, 0.06),

    // returns derivation
    returnsBg: hexToRgba(p.returns, 0.08),

    // opm derivation
    opmBg: hexToRgba(p.opm, 0.08),

    // loss derivation
    lossBg: hexToRgba(p.loss, 0.07),

    // text primaries (standalone — OKLCH derivation deferred)
    textSecondary: p.textSecondary,
    textSubtle: p.textSubtle,
    neutralBg: hexToRgba(p.textNeutral, 0.10),

    // bg-derived UI tokens
    bgOverlay: hexToRgba(shiftLightness(p.bg, -30), 0.4),
    borderSubtle: relativeLuminance(p.bg) < 0.5
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(0, 0, 0, 0.06)',
    toggleOff: (() => {
      const [bgH, bgS] = hexToHsl(p.bg);
      return hslToHex(bgH, Math.min(bgS * 0.2, 25), 73 + 10 * dir);
    })(),

    // scrollbar statics
    scrollbarThumb: statics.scrollbarThumb!,
    scrollbarThumbHover: statics.scrollbarThumbHover!,
  };

  return {
    colors,
    logoColor: p.brand,
    heroLine1Color: p.brand,
    heroLine2Color: p.brandAccent,
    glowColor: hexToRgba(p.brandAccent, 0.50),
    blobColors: [
      hexToRgba(p.brandAccent, 0.10),
      hexToRgba(p.brandAccent, 0.05),
    ],
  };
};
