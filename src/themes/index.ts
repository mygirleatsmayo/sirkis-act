import type { ThemeConfig } from './types';
import { cyprusTheme } from './cyprus';
import { playgroundTheme } from './playground';
import { cyprusLockedTheme } from './cyprusLocked';

export const themes: Record<string, ThemeConfig> = {
  cyprus: cyprusTheme,
  playground: playgroundTheme,
  cyprusLocked: cyprusLockedTheme,
};

export const defaultThemeId = 'cyprus';

export const getTheme = (id: string): ThemeConfig =>
  themes[id] ?? themes[defaultThemeId];

export { useTheme } from './useTheme';
export { DEFAULT_THEME_CAPABILITIES, DEFAULT_THEME_EDITOR, resolveTheme } from './resolveTheme';
export type {
  ThemeConfig,
  ThemeColors,
  ThemeBranding,
  ThemeFonts,
  ThemeEffects,
  ThemeCapabilities,
  ThemeEditorConfig,
  ResolvedThemeConfig,
  LogoComponent,
} from './types';
