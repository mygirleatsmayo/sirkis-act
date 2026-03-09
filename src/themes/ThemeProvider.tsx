import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { getTheme, defaultThemeId } from './index';
import { resolveTheme } from './resolveTheme';
import { ThemeContext } from './ThemeContext';
import { syncCssVars } from './syncCssVars';
import type { ThemeConfig } from './types';

const STORAGE_KEY = 'sirkis-theme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeId, setThemeIdState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // Never restore transient working-copy themes from a previous session
      return stored && stored !== 'playground' ? stored : defaultThemeId;
    } catch {
      return defaultThemeId;
    }
  });

  const [themeOverride, setThemeOverride] = useState<ThemeConfig | null>(null);

  const baseTheme = useMemo(() => getTheme(themeId), [themeId]);
  const theme = useMemo(
    () => resolveTheme(themeOverride ?? baseTheme),
    [baseTheme, themeOverride],
  );

  const setThemeId = useCallback((id: string) => {
    setThemeIdState(id);
    // Don't persist transient working-copy themes (e.g. playground used by Theme Lab)
    if (id !== 'playground') {
      try {
        localStorage.setItem(STORAGE_KEY, id);
      } catch {
        // localStorage unavailable
      }
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
