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
