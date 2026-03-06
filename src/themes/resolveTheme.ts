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
  logoColorModeEditable: true,
};

export const resolveTheme = (theme: ThemeConfig): ResolvedThemeConfig => {
  const capabilities: ThemeCapabilities = {
    ...DEFAULT_THEME_CAPABILITIES,
    ...theme.capabilities,
  };

  const editor: ThemeEditorConfig = {
    ...DEFAULT_THEME_EDITOR,
    ...theme.editor,
    logoColorModeEditable:
      theme.editor?.logoColorModeEditable ?? capabilities.logoColorMode === 'themed',
  };

  return {
    ...theme,
    capabilities,
    editor,
  };
};
