import type {
  ThemeCapabilities,
  ThemeConfig,
  ThemeEditorConfig,
  ResolvedThemeConfig,
} from './types';

export const DEFAULT_THEME_CAPABILITIES: ThemeCapabilities = {
  showLogo: true,
  showTagline: true,
  showHero: true,
  showHeroLine2: true,
  showSubhead: true,
  showSirkisms: true,
  subheadMode: 'structured',
  logoColorMode: 'themed',
};

export const DEFAULT_THEME_EDITOR: ThemeEditorConfig = {
  kind: 'studio',
};

export const resolveTheme = (theme: ThemeConfig): ResolvedThemeConfig => ({
  ...theme,
  capabilities: {
    ...DEFAULT_THEME_CAPABILITIES,
    ...theme.capabilities,
  },
  editor: {
    ...DEFAULT_THEME_EDITOR,
    ...theme.editor,
  },
});
