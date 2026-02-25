import { createContext } from 'react';
import type { ThemeConfig } from './types';

export interface ThemeContextValue {
  theme: ThemeConfig;
  themeId: string;
  setThemeId: (id: string) => void;
  setThemeOverride: (theme: ThemeConfig | null) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
