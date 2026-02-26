import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { getTheme, defaultThemeId } from './index';
import { ThemeContext } from './ThemeContext';
import { syncCssVars } from './syncCssVars';
import type { ThemeConfig } from './types';

const STORAGE_KEY = 'sirkis-theme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeId, setThemeIdState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? defaultThemeId;
    } catch {
      return defaultThemeId;
    }
  });

  const [themeOverride, setThemeOverride] = useState<ThemeConfig | null>(null);

  const baseTheme = useMemo(() => getTheme(themeId), [themeId]);
  const theme = themeOverride ?? baseTheme;

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

  const value = useMemo(
    () => ({ theme, themeId, setThemeId, setThemeOverride }),
    [theme, themeId, setThemeId, setThemeOverride],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
