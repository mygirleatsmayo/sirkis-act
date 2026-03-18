// src/themes/derivationRules.ts
import type { ThemeColors } from './types';
import { shiftOklchLightness, hexToOklch, oklchToHex, hexToRgba } from '../utils/colorMath';
// TODO: Text secondary/subtle defaults remain pass-through primaries.
// Future opt-in OKLCH formulas are documented inline next to textSecondary/textSubtle.

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
    bgGlass: shiftOklchLightness(p.bg, 0.02 * dir),
    bgInput: shiftOklchLightness(p.bg, -0.03 * dir),
    borderDefault: shiftOklchLightness(p.bg, 0.08 * dir),

    // muted surface (darker than parent glass cards)
    mutedBg: mode === 'dark' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    surfaceHover: hexToRgba(p.textPrimary, 0.06),
    surfaceSunken: mode === 'dark' ? 'rgba(0, 0, 0, 0.20)' : 'rgba(0, 0, 0, 0.06)',

    // text on brand (standalone — OKLCH derivation deferred)
    textOnBrand: p.textOnBrand,

    // brand derivations
    brandBg: hexToRgba(p.brand, 0.06),
    focusRing: p.brand,
    sliderAccent: p.brand,
    sliderAccentHover: shiftOklchLightness(p.brand, -0.05 * dir),

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

    // Future OKLCH derivation (activate when themes opt in):
    // textSecondary: deriveTextFromBg(p.bg, mode === 'dark' ? 0.82 : 0.30, 0.03),
    // textSubtle: deriveTextFromBg(p.bg, mode === 'dark' ? 0.55 : 0.50, 0.02),
    textSecondary: p.textSecondary,
    textSubtle: p.textSubtle,
    neutralBg: hexToRgba(p.textNeutral, 0.10),

    // bg-derived UI tokens
    bgOverlay: hexToRgba(shiftOklchLightness(p.bg, -0.30), 0.4),
    borderSubtle: hexToRgba(p.textPrimary, 0.06),
    borderMuted: hexToRgba(p.textPrimary, 0.10),
    toggleOff: (() => {
      const [, bgC, bgH] = hexToOklch(p.bg);
      const targetL = mode === 'dark' ? 0.75 : 0.65;
      return oklchToHex(targetL, Math.min(bgC * 0.15, 0.03), bgH);
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
