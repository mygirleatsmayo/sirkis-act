import type { ThemeConfig } from './types';
import { cyprusTheme } from './cyprus';
import { playgroundTheme } from './playground';
import { cyprusLockedTheme } from './cyprusLocked';
import { overheatedRhizomeLightTheme } from './overheatedRhizomeLight';

export const themes: Record<string, ThemeConfig> = {
  cyprus: cyprusTheme,
  'overheated-rhizome-light': overheatedRhizomeLightTheme,
  playground: playgroundTheme,
  cyprusLocked: cyprusLockedTheme,
};

export const defaultThemeId = 'cyprus';

export const getTheme = (id: string): ThemeConfig =>
  themes[id] ?? themes[defaultThemeId];

/** Themes available in the user-facing theme switcher (hides playground + QA fixtures). */
export const getSelectableThemes = (): ThemeConfig[] =>
  Object.values(themes).filter(
    (t) => t.id !== 'playground' && !t.id.toLowerCase().includes('locked')
  );

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
