import { createContext } from 'react';
import type { ThemeConfig, ResolvedThemeConfig } from './types';

export interface ThemeContextValue {
  theme: ResolvedThemeConfig;
  themeId: string;
  setThemeId: (id: string) => void;
  setThemeOverride: (theme: ThemeConfig | null) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
