import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ThemeConfig } from './types';
import { getTheme, defaultThemeId } from './index';

interface ThemeContextValue {
  theme: ThemeConfig;
  themeId: string;
  setThemeId: (id: string) => void;
}

const STORAGE_KEY = 'sirkis-theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

const camelToKebab = (s: string) =>
  s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

const syncCssVars = (theme: ThemeConfig) => {
  const root = document.documentElement;

  // Colors
  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(`--color-${camelToKebab(key)}`, value);
  }

  // Fonts
  root.style.setProperty('--font-display', theme.fonts.display);
  root.style.setProperty('--font-sans', theme.fonts.sans);
  root.style.setProperty('--font-mono', theme.fonts.mono);

  // Glow effect colors
  theme.effects.glowColors.forEach((color, i) => {
    root.style.setProperty(`--glow-color-${i}`, color);
  });

  // Scrollbar colors
  root.style.setProperty('--color-scrollbar-thumb', theme.colors.scrollbarThumb);
  root.style.setProperty('--color-scrollbar-thumb-hover', theme.colors.scrollbarThumbHover);

  // Meta theme-color
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme.colors.bg);

  // Body background
  document.body.style.backgroundColor = theme.colors.bg;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeId, setThemeIdState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? defaultThemeId;
    } catch {
      return defaultThemeId;
    }
  });

  const theme = useMemo(() => getTheme(themeId), [themeId]);

  const setThemeId = useCallback((id: string) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // localStorage unavailable
    }
  }, []);

  useEffect(() => {
    syncCssVars(theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, themeId, setThemeId }), [theme, themeId, setThemeId]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
