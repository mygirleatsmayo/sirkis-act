# Theme Fixes — Round 2

## Batch 1 — Cyprus Color Defaults + Start-Now Button Rework

### Color defaults

All in [cyprus.ts](file:///Users/mygirleatsmayo/Desktop/Dev/sirkis-act/src/themes/cyprus.ts):

| Token | Current | New |
|---|---|---|
| `loss` | `#FF4444` | `#E65C5C` |
| `startNow` | `#00BBBB` | `#5CE6E6` |
| `opm` | `#9DE093` | `#74c365` |

Derivation tests in `derivationRules.test.ts` will need updated primaries to match.

### Start-Now button text inversion

[App.tsx:839](file:///Users/mygirleatsmayo/Desktop/Dev/sirkis-act/src/App.tsx#L839) — inactive (filled) state:
- **Current**: `text-content-primary` on `bg: theme.colors.startNow`
- **New**: text uses `theme.colors.bg` (or `bgGlass`) so button truly inverts — dark text on bright startNow bg

> [!IMPORTANT]
> With startNow changing to `#5CE6E6` (light cyan), `text-content-primary` (white in dark mode) will have poor contrast on the bright bg. Using `theme.colors.bg` (dark teal) gives strong contrast and natural inversion.

### startNowBg removal

Remove `startNowBg` from `types.ts`, `derivationRules.ts`, `cyprus.ts`, `tailwind.config.js`, `ThemeLab.tsx`, and tests. Zero visible consumers.

---

## Batch 2 — Lucide Icon Swaps + Contribution Timing Label

### Icon swaps in [App.tsx](file:///Users/mygirleatsmayo/Desktop/Dev/sirkis-act/src/App.tsx):

| Field | Current Icon | New Icon | Lucide Name |
|---|---|---|---|
| Start Investing At (L344) | `Clock` | Hourglass | `Hourglass` |
| Life Expectancy (L372) | `Clock` | Skull | `Skull` |
| Retirement Age (L371) | `Briefcase` | Palm tree | `TreePalm` |
| Inflation Rate (L425) | `TrendingUp` | Balloon | `Balloon` |
| Salary Growth (L424) | `TrendingUp` | Sprout | `Sprout` |
| Expected Return (L423) | `TrendingUp` | Rocket | `Rocket` |

New imports needed: `Hourglass, Skull, TreePalm, Balloon, Sprout, Rocket, Calendar`
Remove `Briefcase` (replaced by `TreePalm`). Keep all other existing icon imports.

### Icon hover state fix

Input field icons currently use `text-accent-opm` on hover (`group-hover:text-accent-opm` in InputField). Should be `group-hover:text-accent-brand`.

### Static info icon fix

The bottom/last/fourth info icon (static, non-tooltip) consumes the OPM token. Should consume `text-content-subtle`.

### Contribution timing label (L401)

**Current**: plain `<label>` with no icon
**New**: match InputField label style — add `Calendar` icon before "Contribution Timing" text, style consistent with other `<label>` elements (flex, gap, icon color)

---

## Batch 3 — iOS Mobile Meta Theme-Color

L86 from TODO: primary background not adjusting the block behind address bar.

> [!NOTE]
> This may be a Theme Lab issue (Theme Lab changes not propagating to meta tag) rather than a theming system issue. `syncCssVars.ts` already updates `<meta name="theme-color">` on theme change.

Investigate:
1. Does Theme Lab call `syncCssVars` when colors change?
2. Does `index.html` have `viewport-fit=cover` in viewport meta?
3. Is there an iOS-specific issue with `theme-color` updating dynamically?

---

## Batch 4 — bgCard Token Removal

Remove from 6 files (if user confirms after Batch 1 QA):

| File | What to remove |
|---|---|
| `types.ts` | `bgCard` property from `ThemeColors` |
| `derivationRules.ts` | `bgCard` derivation line |
| `cyprus.ts` | `bgCard` default value |
| `tailwind.config.js` | `surface.card` mapping |
| `ThemeLab.tsx` | `bgCard` from TOKEN_SECTIONS + derivedPaths |
| `derivationRules.test.ts` | bgCard test assertion |

---

## Verification Plan

### Automated
- `npx tsc --noEmit`
- `npx vitest run`

### Manual QA
- **Color defaults**: verify loss, startNow, opm visually match new hex values
- **Start-Now button**: verify dark text on bright cyan bg in dark mode, appropriate contrast in light mode
- **Icons**: verify all 6 swapped icons render correctly, contribution timing has Calendar icon
- **iOS**: test on iPhone — address bar bg should match theme bg color
