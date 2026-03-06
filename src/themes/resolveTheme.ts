import type {
  ThemeCapabilities,
  ThemeConfig,
  ThemeEditorConfig,
  ResolvedThemeConfig,
} from './types';

export const DEFAULT_THEME_CAPABILITIES: ThemeCapabilities = {
  showLogo: true,
  showTagline: true,
  showHeroLine1: true,
  showHeroLine2: true,
  showSubhead: true,
  showSirkisms: true,
  subheadMode: 'bold',
  subheadWrap: 'pretty',
  subheadWidowControl: true,
  logoColorMode: 'themed',
};

export const DEFAULT_THEME_EDITOR: ThemeEditorConfig = {
  kind: 'studio',
  logoColorModeEditable: true,
};

export const resolveTheme = (theme: ThemeConfig): ResolvedThemeConfig => {
  const legacyCapabilities = theme.capabilities as (Partial<ThemeCapabilities> & {
    showHero?: boolean;
  }) | undefined;
  const legacySubheadMode = (theme.capabilities as Record<string, unknown> | undefined)?.subheadMode;

  const capabilities: ThemeCapabilities = {
    ...DEFAULT_THEME_CAPABILITIES,
    ...theme.capabilities,
    showHeroLine1:
      theme.capabilities?.showHeroLine1
      ?? legacyCapabilities?.showHero
      ?? DEFAULT_THEME_CAPABILITIES.showHeroLine1,
    subheadMode:
      legacySubheadMode === 'structured'
        ? 'bold'
        : (theme.capabilities?.subheadMode ?? DEFAULT_THEME_CAPABILITIES.subheadMode),
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
