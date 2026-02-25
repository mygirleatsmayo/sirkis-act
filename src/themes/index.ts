import type { ThemeConfig } from './types';
import { cyprusTheme } from './cyprus';

export const themes: Record<string, ThemeConfig> = {
  cyprus: cyprusTheme,
};

export const defaultThemeId = 'cyprus';

export const getTheme = (id: string): ThemeConfig =>
  themes[id] ?? themes[defaultThemeId];

export type { ThemeConfig, ThemeColors, ThemeBranding, ThemeFonts, ThemeEffects, LogoComponent } from './types';
