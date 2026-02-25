# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Interactive retirement and savings financial planning tool built for a college professor's curriculum. Users model 401(k)/403(b), Roth IRA, and HSA contributions with employer match, delayed-start comparisons, inflation-adjusted projections, withdrawal modeling through life expectancy, and salary presets by college major.

Live: https://mygirleatsmayo.github.io/sirkis-act/

## Commands

```
npm run dev          # Vite dev server (default port 5173)
npm run build        # tsc -b && vite build (type-check via project references, then bundle)
npm run lint         # ESLint, zero warnings enforced (--max-warnings 0)
npm run test         # vitest run (all tests, single pass)
npm run preview      # serve production build locally
```

Run a single test file:
```
npx vitest run src/__tests__/projection.test.ts
```

## Stack

- React 19, TypeScript 5.7 (strict), Vite 6, Tailwind CSS 3.4, Recharts 3.7
- Vaul (mobile drawer), Lucide React (icons), DOMPurify (SVG sanitization)
- Vitest for testing
- Deployed via GitHub Actions to GitHub Pages on push to `main`

## Architecture

### Single-component monolith

All UI lives in `src/App.tsx` (~1,100 lines). This is intentional; the codebase is kept flat unless component extraction is explicitly agreed upon. The file contains:

- **Helper components** (lines 44–490): `GlassCard`, `Card`, `Badge`, `MetricCard`, `TooltipIcon`, `InputField`, `ToggleSection`, `SettingsPanel` — all defined at module scope, not extracted to separate files.
- **Main `App` component** (line 506+): state management, projection calculations, withdrawal math, responsive layout logic, chart/table rendering, and the mobile drawer (Vaul).
- **Layout pattern**: Desktop uses a fixed-width sidebar (420px) with a scrollable main area. Mobile uses a bottom-sheet drawer (Vaul `Drawer.Root`) for settings.

### Extracted modules

- `src/types.ts` — All TypeScript interfaces and type aliases (`Inputs`, `ProjectionRow`, component prop types, input key unions).
- `src/constants.ts` — `DEFAULT_INPUTS`, `LIMITS` (IRS contribution caps), `SIRKISMS` (rotating quotes), `INPUT_BOUNDS` (slider min/max).
- `src/utils/projection.ts` — `runProjection(inputs, startAgeOverride)`: the core financial engine. Year-by-year loop computing 401(k)/Roth/HSA balances with employer match, IRS cap clamping, contribution timing factor, and inflation adjustment.
- `src/utils/format.ts` — `formatCurrency`, `formatCompact`, `getLossFractionLabel`, `clampNumber`, `hexAlpha`.

### Data flow

1. User inputs → `handleInputChange` callback (with cross-field clamping, e.g., retirementAge > currentAge).
2. `useMemo` calls `runProjection` twice: once with actual `startAge`, once with `currentAge` (for the "start now" comparison line).
3. Results feed into `MetricCard` grid, `AreaChart` / data table, quick stats footer, and withdrawal calculations.
4. The delayed-start comparison shows a loss banner with `getLossFractionLabel` producing human-readable fractions ("half of", "a third of").

### Theme system

- **Runtime theme architecture** with CSS variable sync. Themes are defined in `src/themes/` as `ThemeConfig` objects (colors, branding, fonts, effects). The active theme is resolved by `ThemeProvider` and synced to CSS custom properties via `syncCssVars`.
- **Key files:** `src/themes/types.ts` (interfaces), `src/themes/cyprus.ts` (default theme), `src/themes/playground.ts` (ThemeLab clone), `src/themes/ThemeProvider.tsx` (context + localStorage persistence), `src/themes/ThemeContext.ts`, `src/themes/useTheme.ts` (hook), `src/themes/syncCssVars.ts` (CSS var sync), `src/themes/index.ts` (registry).
- **Theme Lab** (`src/ThemeLab.tsx`): floating panel for live theme editing. Activated via FAB button or `Ctrl+Shift+T`. Renders alongside `<App />` in `src/Root.tsx`. SVG uploads sanitized via DOMPurify.
- `src/components/CrownLogo.tsx` — extracted logo component referenced by themes.
- Tailwind uses semantic tokens mapped to CSS vars (e.g., `surface-card`, `accent-brand`, `content-muted`). Hex tokens are stored as space-separated RGB channels for Tailwind alpha support; rgba tokens are passed through as-is.
- Self-hosted variable fonts in `src/fonts/`: Fraunces (display/serif) and Recursive Sans Linear (UI/sans). Registered in `src/index.css` via `@font-face`, mapped in `tailwind.config.js` as `font-display`, `font-sans`, and `font-mono`.
- Background color (`#003D3A`) synced at runtime by `ThemeProvider`; `index.html` meta theme-color and `index.css` body background provide pre-JS fallbacks.

### Responsive strategy

- Three breakpoints tracked via `useState` + `resize` listener: narrow (<640px), medium (640–1023px), desktop (≥1024px).
- Chart dimensions measured via `ResizeObserver` on the container ref; Recharts receives explicit `width`/`height` (not `ResponsiveContainer`).
- Metric panels switch between 2-column and 3-column layout based on `chartSize.width >= 550`.
- Mobile inputs forced to `font-size: 16px` to prevent iOS zoom (`index.css`).

## Coding Conventions

- **TypeScript strict mode** enforced; no `any`, no suppressed type errors without justification.
- **Zero lint warnings** — `--max-warnings 0`. Always lint before considering work complete.
- **Tailwind CSS** for all styling; avoid inline styles or separate CSS files unless necessary.
- Keep `src/` flat unless component extraction is explicitly agreed upon.
- **No orphan words** in headlines, subheadlines, labels, and short UI text (use `whitespace-nowrap` on last 2–3 words).
- **Non-breaking hyphens** (`\u2011`) for compound words in headlines, labels, and short UI text (e.g., `tax\u2011advantaged`, `Million\u2011Dollar`). Browsers treat regular hyphens as valid break points; `\u2011` prevents mid-word line breaks.
- Do not add docstrings, comments, or type annotations to code you did not change.
- Unused variables prefixed with `_` (ESLint rule: `argsIgnorePattern: "^_"`).

## Testing

Tests live in `src/__tests__/` and use Vitest. Current coverage:
- `constants.test.ts` — validates `LIMITS` and `DEFAULT_INPUTS` shape/values.
- `format.test.ts` — `formatCurrency` and `formatCompact` edge cases.
- `projection.test.ts` — IRS cap clamping, employer match math, zero-contribution behavior, inflation adjustment, delayed vs. immediate start.

No component/integration tests exist yet. The projection engine (`runProjection`) is the most critical function to keep tested.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) runs on push to `main`:
1. `npm ci` → `npm run build` → uploads `dist/` as Pages artifact.
2. Vite `base` is set to `/sirkis-act/` in `vite.config.ts` — all asset paths are relative to this.

## Git Conventions

- **No `/` separators** in branch names; use hyphens (e.g., `ui-polish-2`, not `ui/polish-2`).
- **Sub-branches** use `/` off a namespace that is not itself a branch (e.g., `ui-polish-2/stats-panels`).
- Git worktrees for parallel work use sibling dirs: `sirkis-act--themes`, `sirkis-act--oz`, etc.
- When using worktrees, assign distinct dev server ports (primary 5173, themes 5174, agent 5175).

## Session Workflow

- `SESSION_LOG.md` tracks session history — read it before starting work to understand recent changes and pending items.
- `CHANGELOG.md` tracks user-facing changes.
- Update `SESSION_LOG.md` on major task completion, 24h+ resume, or session end.
