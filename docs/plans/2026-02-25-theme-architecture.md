# Theme Architecture Implementation Plan

**Goal:** Replace all hardcoded colors, branding, and fonts with a themeable system powered by a JS theme object, CSS custom properties, and Tailwind semantic tokens.

**Architecture:** Typed `ThemeConfig` objects in `src/themes/` are the single source of truth. A React context (`ThemeProvider`) provides the active theme to all components. A `useEffect` syncs color tokens to CSS custom properties on `:root`, which Tailwind semantic classes consume. Recharts and branding components read directly from the JS theme object via `useTheme()`. Theme selection persists in localStorage.

**Tech Stack:** React context, CSS custom properties, Tailwind config extension, localStorage, TypeScript strict types.

---

## Task 1: Define the ThemeConfig type

**Files:**
- Create: `src/themes/types.ts`

**Step 1: Write the type definition**

```ts
import type { ComponentType } from 'react';

/** Logo component contract — receives className for sizing */
export type LogoComponent = ComponentType<{ className?: string }>;

export interface ThemeColors {
  // Backgrounds (darkest → lightest for dark themes; reversed for light)
  bg: string;                 // body / main background
  bgCard: string;             // Card component backgrounds
  bgGlass: string;            // GlassCard / sidebar / elevated surfaces
  bgInput: string;            // input, select, number fields
  bgOverlay: string;          // modal overlays, drawer overlay
  bgMuted: string;            // withdrawal cards, comparison sub-cards

  // Borders
  borderDefault: string;      // input borders, dividers
  borderSubtle: string;       // card borders, faint separators

  // Text
  textPrimary: string;        // headings, primary content
  textSecondary: string;      // secondary labels, values
  textMuted: string;          // tertiary content, descriptions
  textSubtle: string;         // helper text, timestamps, faint labels
  textOnBrand: string;        // text rendered on brand-colored backgrounds

  // Semantic accents
  brand: string;              // primary brand / Your Contributions
  brandBg: string;            // brand tint background
  opm: string;                // Employer Match (OPM)
  returns: string;            // Investment Returns / gold accent
  returnsBg: string;          // returns tint background
  startNow: string;           // Start Now comparison line
  startNowBg: string;         // start-now tint background
  loss: string;               // loss / error / destructive
  lossBg: string;             // loss tint background
  neutral: string;            // neutral badge, misc

  // Interactive
  focusRing: string;          // focus-visible outlines
  sliderAccent: string;       // range input accent
  sliderAccentHover: string;  // range input accent hover
  toggleOff: string;          // toggle switch off-state track
  scrollbarThumb: string;     // custom scrollbar thumb
  scrollbarThumbHover: string;
}

export interface ThemeBranding {
  logo: LogoComponent;
  appName: string;              // e.g. 'Sirkis Act'
  tagline: string;              // e.g. 'Old-Fashioned Financial Planning'
  heroLine1: string;            // e.g. "Dr. Sirkis's"
  heroLine2: string;            // e.g. 'High-Wire Act'
  heroSubhead: string;          // e.g. 'Fall into a Million-Dollar Safety Net...'
  heroLine1Color: string;       // color for hero line 1
  heroLine2Color: string;       // color for hero line 2
}

export interface ThemeFonts {
  display: string;              // e.g. 'Fraunces, Georgia, serif'
  sans: string;                 // e.g. 'Recursive, system-ui, sans-serif'
  mono: string;                 // e.g. 'JetBrains Mono, ui-monospace, monospace' — for financial figures
}

export interface ThemeEffects {
  blobs: {
    color: string;
    position: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
    opacity: number;
  }[];
  glowColors: string[];         // rgba strings for pulse-glow animation
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: ThemeColors;
  branding: ThemeBranding;
  fonts: ThemeFonts;
  effects: ThemeEffects;
}
```

**Step 2: Commit**

```bash
git add src/themes/types.ts
git commit -m "feat(theme): add ThemeConfig type definition"
```

---

## Task 2: Create the Cyprus default theme

**Files:**
- Create: `src/themes/cyprus.ts`
- Move: CrownLogo from `src/App.tsx` to `src/components/CrownLogo.tsx`

**Step 1: Extract CrownLogo to its own file**

Move the existing `CrownLogo` component from App.tsx (lines 54–60) into `src/components/CrownLogo.tsx` as a named export. Update the import in App.tsx.

**Step 2: Write the Cyprus theme definition**

Map every current hardcoded color to the corresponding `ThemeConfig` field. Source values from:
- `THEME` const in `src/constants.ts` (brand, opm, returns, etc.)
- Hardcoded Tailwind classes in `src/App.tsx` (#004745, #004240, #002E2B, #006560)
- `src/index.css` (body bg, focus-visible, glow rgba values)
- `index.html` (meta theme-color)
- Slate color equivalents (white, slate-200, slate-300, slate-400)

```ts
import type { ThemeConfig } from './types';
import { CrownLogo } from '../components/CrownLogo';

export const cyprusTheme: ThemeConfig = {
  id: 'cyprus',
  name: 'Sirkis Cyprus',
  colors: {
    bg: '#003D3A',
    bgGlass: '#004745',
    bgCard: '#004240',
    bgInput: '#002E2B',
    bgOverlay: 'rgba(15, 23, 42, 0.4)',   // slate-900/40 (drawer overlay)
    bgMuted: 'rgba(0, 61, 58, 0.6)',       // #003D3A/60

    borderDefault: '#006560',
    borderSubtle: 'rgba(255, 255, 255, 0.06)',

    textPrimary: '#ffffff',
    textSecondary: '#e2e8f0',   // slate-200
    textMuted: '#cbd5e1',       // slate-300
    textSubtle: '#94a3b8',      // slate-400
    textOnBrand: '#ffffff',

    brand: '#00A499',
    brandBg: 'rgba(0, 164, 153, 0.06)',
    opm: '#A8A8A8',
    returns: '#E6C300',
    returnsBg: 'rgba(230, 195, 0, 0.08)',
    startNow: '#0D9488',
    startNowBg: 'rgba(13, 148, 136, 0.08)',
    loss: '#D32F2F',
    lossBg: 'rgba(211, 47, 47, 0.07)',
    neutral: 'rgba(255, 255, 255, 0.10)',

    focusRing: '#00A499',
    sliderAccent: '#00A499',
    sliderAccentHover: '#0D9488',
    toggleOff: '#cbd5e1',       // slate-300
    scrollbarThumb: 'rgba(148, 163, 184, 0.3)',
    scrollbarThumbHover: 'rgba(148, 163, 184, 0.5)',
  },
  branding: {
    logo: CrownLogo,
    appName: 'Sirkis Act',
    tagline: 'Old-Fashioned Financial Planning',
    heroLine1: "Dr. Sirkis's",
    heroLine2: 'High-Wire Act',
    heroSubhead: 'Fall into a Million-Dollar Safety Net with tax-advantaged compounding.',
    heroLine1Color: '#00A499',  // brand
    heroLine2Color: '#E6C300',  // returns/gold
  },
  fonts: {
    display: 'Fraunces, Georgia, serif',
    sans: 'Recursive, system-ui, sans-serif',
    mono: 'Recursive, ui-monospace, monospace',  // placeholder — swap for a dedicated number font per theme
  },
  effects: {
    blobs: [
      { color: 'rgba(230, 195, 0, 0.10)', position: 'top-right', opacity: 1 },
      { color: 'rgba(230, 195, 0, 0.05)', position: 'bottom-right', opacity: 1 },
    ],
    glowColors: [
      'rgba(230, 195, 0, 0.50)',
      'rgba(230, 195, 0, 0.32)',
      'rgba(230, 195, 0, 0.20)',
    ],
  },
};
```

**Step 3: Commit**

```bash
git add src/components/CrownLogo.tsx src/themes/cyprus.ts src/App.tsx
git commit -m "feat(theme): extract CrownLogo, create Cyprus theme definition"
```

---

## Task 3: Create the theme registry and index

**Files:**
- Create: `src/themes/index.ts`

**Step 1: Write the registry**

```ts
import type { ThemeConfig } from './types';
import { cyprusTheme } from './cyprus';

export const themes: Record<string, ThemeConfig> = {
  cyprus: cyprusTheme,
};

export const defaultThemeId = 'cyprus';

export const getTheme = (id: string): ThemeConfig =>
  themes[id] ?? themes[defaultThemeId];

export type { ThemeConfig, ThemeColors, ThemeBranding, ThemeFonts, ThemeEffects, LogoComponent } from './types';
```

**Step 2: Commit**

```bash
git add src/themes/index.ts
git commit -m "feat(theme): add theme registry and index"
```

---

## Task 4: Build ThemeProvider and useTheme hook

**Files:**
- Create: `src/themes/ThemeProvider.tsx`

**Step 1: Write the provider**

The provider:
1. Reads `sirkis-theme` from localStorage on mount
2. Resolves to a `ThemeConfig` via `getTheme()`
3. Syncs all `colors` to CSS custom properties on `:root` when theme changes
4. Updates `meta[theme-color]` and `document.body.style.backgroundColor`
5. Updates font CSS custom properties for Tailwind
6. Exposes `theme` and `setThemeId` via context

```ts
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

  // Meta theme-color
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme.colors.bg);

  // Body background
  document.body.style.backgroundColor = theme.colors.bg;
};

const camelToKebab = (s: string) =>
  s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

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
```

**Step 2: Commit**

```bash
git add src/themes/ThemeProvider.tsx
git commit -m "feat(theme): add ThemeProvider context and useTheme hook"
```

---

## Task 5: Extend Tailwind config with semantic tokens

**Files:**
- Modify: `tailwind.config.js`

**Step 1: Map semantic color names to CSS custom properties**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        surface: {
          DEFAULT: 'var(--color-bg)',
          glass: 'var(--color-bg-glass)',
          card: 'var(--color-bg-card)',
          input: 'var(--color-bg-input)',
          overlay: 'var(--color-bg-overlay)',
          muted: 'var(--color-bg-muted)',
        },
        border: {
          theme: 'var(--color-border-default)',
          subtle: 'var(--color-border-subtle)',
        },
        content: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          subtle: 'var(--color-text-subtle)',
          'on-brand': 'var(--color-text-on-brand)',
        },
        accent: {
          brand: 'var(--color-brand)',
          'brand-bg': 'var(--color-brand-bg)',
          opm: 'var(--color-opm)',
          returns: 'var(--color-returns)',
          'returns-bg': 'var(--color-returns-bg)',
          'start-now': 'var(--color-start-now)',
          'start-now-bg': 'var(--color-start-now-bg)',
          loss: 'var(--color-loss)',
          'loss-bg': 'var(--color-loss-bg)',
          neutral: 'var(--color-neutral)',
        },
        interactive: {
          focus: 'var(--color-focus-ring)',
          slider: 'var(--color-slider-accent)',
          'slider-hover': 'var(--color-slider-accent-hover)',
          'toggle-off': 'var(--color-toggle-off)',
        },
      },
      // Scrollbar colors can't use Tailwind utilities; handled in index.css via var()
    },
  },
  plugins: [],
};
```

**Step 2: Commit**

```bash
git add tailwind.config.js
git commit -m "feat(theme): extend Tailwind config with semantic color tokens"
```

---

## Task 6: Update index.css to use CSS custom properties

**Files:**
- Modify: `src/index.css`

**Step 1: Replace all hardcoded colors with var() references**

- `body { background-color: var(--color-bg); }`
- Focus-visible outlines: `outline: 2px solid var(--color-focus-ring);`
- Scrollbar thumb: `background: var(--color-scrollbar-thumb);`
- Pulse-glow: use `var(--glow-color-1)`, `var(--glow-color-2)`, `var(--glow-color-3)` (synced from `theme.effects.glowColors` by ThemeProvider)

Note: The ThemeProvider `syncCssVars` function needs to also sync glow colors and scrollbar colors. Update it to handle `effects.glowColors` as `--glow-color-0`, `--glow-color-1`, `--glow-color-2`.

**Step 2: Commit**

```bash
git add src/index.css
git commit -m "feat(theme): replace hardcoded CSS colors with custom properties"
```

---

## Task 7: Wrap app in ThemeProvider

**Files:**
- Modify: `src/main.tsx`

**Step 1: Add ThemeProvider around App**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "./themes/ThemeProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
```

**Step 2: Commit**

```bash
git add src/main.tsx
git commit -m "feat(theme): wrap app in ThemeProvider"
```

---

## Task 8: Migrate App.tsx — remove THEME const, use semantic classes

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/constants.ts` (remove `THEME` const)

This is the largest task. It involves:

1. Add `useTheme()` at the top of the `App` component and in `SettingsPanel`
2. Replace all `THEME.xxx` references with `theme.colors.xxx` from context
3. Replace all hardcoded hex Tailwind classes with semantic tokens:
   - `bg-[#004745]` → `bg-surface-glass`
   - `bg-[#004240]` → `bg-surface-card`
   - `bg-[#002E2B]` → `bg-surface-input`
   - `bg-[#003D3A]` → `bg-surface`
   - `border-[#006560]` → `border-theme`
   - `border-white/[0.06]` → `border-subtle`
   - `text-slate-200` → `text-content-secondary`
   - `text-slate-300` → `text-content-muted`
   - `text-slate-400` → `text-content-subtle`
   - `accent-[#00A499]` → uses `var(--color-slider-accent)` via CSS
4. Replace hardcoded branding strings with `theme.branding.*`:
   - CrownLogo usage → `theme.branding.logo`
   - "Sirkis Act" → `theme.branding.appName`
   - "Old-Fashioned Financial Planning" → `theme.branding.tagline`
   - Hero headline spans → `theme.branding.heroLine1`, `heroLine2`
   - Hero subhead → `theme.branding.heroSubhead`
5. Replace hardcoded font families with Tailwind `font-display` / `font-sans` (already in config, but verify all usages go through Tailwind, not inline styles)
6. Replace blob hardcoded values with theme.effects.blobs rendering
7. Remove `THEME` and `SIRKISMS` color usage from constants.ts (keep `SIRKISMS` itself, remove `THEME`)

**Approach:** Work through App.tsx top-to-bottom, component by component:
- Helper components (GlassCard, Card, Badge, MetricCard, TooltipIcon, InputField, ToggleSection, SettingsPanel)
- Main App component (state, calculations, layout, chart, table, withdrawals, mobile drawer)

**Step N (final): Commit**

```bash
git add src/App.tsx src/constants.ts
git commit -m "feat(theme): migrate App.tsx to semantic theme tokens"
```

---

## Task 9: Update index.html

**Files:**
- Modify: `index.html`

**Step 1: Remove hardcoded theme-color value**

The `meta[theme-color]` content will be set by ThemeProvider at runtime. Set a sensible default that works before JS loads (Cyprus bg color is fine as default).

**Step 2: Commit**

```bash
git add index.html
git commit -m "feat(theme): note runtime theme-color in index.html"
```

---

## Task 10: Verify — lint, type-check, test, visual check

**Step 1: Run type-check**

```bash
npm run build
```

Expected: no TypeScript errors.

**Step 2: Run lint**

```bash
npm run lint
```

Expected: zero warnings.

**Step 3: Run tests**

```bash
npm run test
```

Expected: all 24 tests pass. Some tests import from `constants.ts` and reference `LIMITS` / `DEFAULT_INPUTS` — these should be unaffected. If any test imported `THEME`, update to use the Cyprus theme object.

**Step 4: Visual check**

```bash
npm run dev
```

Open localhost:5173/sirkis-act/ and verify the app looks identical to the deployed site. Check:
- Desktop sidebar + main area colors
- Mobile drawer appearance
- Chart colors and tooltip styling
- Badge colors
- Input field backgrounds and borders
- Focus ring colors
- Glow animation on mobile peek handle
- Hero headline colors

**Step 5: Commit any fixes, then final commit**

```bash
git add -A
git commit -m "feat(theme): verify and fix migration"
```

---

## Task 11: Clean up palette reference files

**Files:**
- Delete or move: `palette-purple-gold.css`, `palette-teal-gold.css`, `palette-temp.css`

These reference files predate the theme system. Their color values are now captured in a more structured way. Ask user whether to delete them or move them to `docs/reference/`.

---

## Summary of new/modified files

| File | Action |
|------|--------|
| `src/themes/types.ts` | Create — ThemeConfig type |
| `src/themes/cyprus.ts` | Create — default theme definition |
| `src/themes/index.ts` | Create — theme registry |
| `src/themes/ThemeProvider.tsx` | Create — context, useTheme, CSS var sync |
| `src/components/CrownLogo.tsx` | Create — extracted from App.tsx |
| `tailwind.config.js` | Modify — semantic color tokens |
| `src/index.css` | Modify — CSS vars instead of hardcoded colors |
| `src/main.tsx` | Modify — wrap in ThemeProvider |
| `src/App.tsx` | Modify — migrate all colors/branding to theme |
| `src/constants.ts` | Modify — remove THEME const |
| `index.html` | Modify — theme-color comment |
