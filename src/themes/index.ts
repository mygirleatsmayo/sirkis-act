import type { ThemeConfig } from './types';
import { cyprusTheme } from './cyprus';
import { playgroundTheme } from './playground';

export const themes: Record<string, ThemeConfig> = {
  cyprus: cyprusTheme,
  playground: playgroundTheme,
};

export const defaultThemeId = 'cyprus';

export const getTheme = (id: string): ThemeConfig =>
  themes[id] ?? themes[defaultThemeId];

export { useTheme } from './useTheme';
export type { ThemeConfig, ThemeColors, ThemeBranding, ThemeFonts, ThemeEffects, LogoComponent } from './types';
