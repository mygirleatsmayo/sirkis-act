# Changelog
---

## [Unreleased]

- **Starting Balances**: Added inputs to seamlessly seed existing account balances for 401(k), Roth IRA, and HSA projections compounding from year one.
- **Dynamic Y-Axis Scaling**: Enhanced chart scale logic to calculate perfect visual intervals (supporting decimals like $3.375M) and removed premature curve compression on hidden start-now overlays.
- **Theme Switcher Carousel**: Accordion-style theme preview carousel in Settings with expanded/folded cards, arrow navigation, responsive layout, and motion animations.

---

## [1.4.0] - 2026-03-09 — New Logo, Theme Lab Overhaul & Branding Flexibility

- **New Elephant Logo**: Cyprus theme now features an elephant mascot logo in the header, replacing the abstract crown. Logo is proportionally sized and bottom-aligned with the app name on desktop; collapses gracefully in the mobile header.
- **Theme Design Compatibility (Waves 1-3)**: Added robust per-theme capability handling, locked/studio/studioNoDerivation editor behavior, and safe defaults/fallback resolution for compatibility across preinstalled and future themes.
- **Projection Token Independence**: target and selfFunded colors decoupled from brand, enabling per-theme projection palettes.
- **Text Token Policy**: textSecondary and textSubtle promoted to standalone primaries (no auto-derivation); OKLCH-based derivation deferred.
- **Glow Consolidation**: Three glow color tokens consolidated to a single `glowColor` token; CSS uses `color-mix()` for layered box-shadow effects.
- **bg-Derived UI Tokens**: bgOverlay, borderSubtle, and toggleOff now derive dynamically from the bg primary instead of being hardcoded per mode.
- **Numeric Typography Contract**: `tabular-nums` restricted to table body; stat footer and withdrawal cards use proportional figures.
- **Theme Lab Palette Restructuring**: Primaries section renamed to Palette with Source (auto-derives linked tokens) and Standalone (no derivation) subsections.
- **Theme Lab Label Renames**: returns→Growth, opm→Employer Funded, textNeutral→Real Value for clearer semantic meaning.
- **Derivation Toggle**: Auto/Manual toggle in Theme Lab controls whether primary edits auto-derive linked tokens. When off, lock buttons and derived count badges are hidden.
- **Theme Lab Tooltips**: Replaced all native `title` attributes with touch-aware tooltips (instant hover on desktop, tap-to-toggle on mobile with outside-click dismiss).
- **Playground Persistence Fix**: `playground` theme ID is no longer persisted to localStorage, preventing stale working-copy themes from loading on refresh.
- **Graceful Branding Degradation**: App now handles missing/empty logo/tagline/hero/subhead/sirkisms content without layout artifacts, with clearer hero visibility rules.
- **Subhead Authoring Controls**: Added subhead wrap and widow controls, upgraded subhead emphasis modes (`plain`, `bold`, `italic`, `boldItalic`), and improved spacing logic so Theme Lab users do not need manual boundary spaces between subhead parts.
- **Disclosure UX Finalization**: Disclosure trigger behavior stabilized across desktop/mobile; desktop disclosure moved to sidebar footer adjacent to reset action to avoid top-content overlap/shift issues.
- **Theme Lab Reliability**: Fixed false-active reset icon regression by normalizing lab-open baseline via derivation engine and resetting token lock state on open.
- **Theme Lab Capabilities UX**: Added mobile-friendly toggles/segmented controls for capabilities and logo-color-mode lock semantics for intrinsic brand logos.
- **Theme Fixtures for QA**: Added locked fixture and intrinsic-logo fixture paths for brand-lock and logo-color-mode validation.
- **Tests Expanded**: Added branding utility coverage (subhead rendering, hero visibility, sirkism safety) and strengthened theme resolver/registry compatibility tests.

---

## [1.3.1] - 2026-03-04 — Tooltip Hover Scope Fix

- **Tooltip Hover Scope Fix**: Desktop sidebar input tooltips now trigger only from the info icon (not the full input row), by isolating tooltip hover/focus group scope.

---

## [1.3.0] - 2026-03-04 — Theme Lab Robustness, Derivation, and Token Semantics (and more)

- **Theme Lab Structural Overhaul**: Removed primary duplicates from token sections; added textNeutral as primary; sticky highlight system for derived tokens; derived count tooltips; hint tooltips for startNow/loss/bgOverlay. *All this and more detailed below.*
- **Theme Lab Derivation Robustness**: Added shared lock-aware derivation application helpers and removed lock-triggered global re-derive churn; re-lock now snaps targeted rows to current derived values.
- **Primary Derivation Consistency**: `textPrimary` and `textNeutral` now behave as true editable primaries in Theme Lab; they are no longer mode-static overrides.
- **Neutral Surface Mapping Fix**: `neutralBg` now derives from the live `textNeutral` primary value (when locked), matching Theme Lab behavior expectations.
- **Theme Lab Reset Baseline Fix**: Reset now uses the active theme snapshot captured at lab open instead of hardcoded Cyprus defaults.
- **Flash Fix**: Restored full app flash (all elements including Recharts) via hybrid override approach; eliminates race condition from previous implementation.
- **Global Reset**: Now clears sticky highlights and pending flash timers.
- **Logo Tokening Fix**: Added `branding.logoColor` (derived from `brand` while locked) so logo color editing/flashing/highlighting is isolated from non-logo elements.
- **Loss Surface Wiring**: `lossBg` now drives delayed/potential-loss panel backgrounds.
- **Badge Background Tokening**: Target and Growth badge backgrounds now consume `brandBg` and `returnsBg` respectively.
- **Theme Token Cleanup**: Removed unused `brandAccentBg`, `startNowBg`, `bgCard`, and `bgMuted` tokens from theme schema/derivations/UI/tests/Tailwind mappings.
- **Color Utility Guard**: `analogous(hex, count)` now safely handles `count <= 1` without invalid math output.

- **Cyprus Color Defaults**: loss=#E65C5C, startNow=#5CE6E6, opm=#74c365.
- **Start-Now Button**: Text inverts with background color for proper contrast.
- **Input Icons**: Hourglass (Start Investing), Skull (Life Expectancy), TreePalm (Retirement), Balloon (Inflation), Sprout (Salary Growth), Rocket (Expected Return), Calendar (Contribution Timing).
- **Icon Hover**: Input field icons highlight with brand color on hover.
- **Contribution Timing**: Label styling matches other input fields with hover states.
- **iOS Warning**: Mobile-only red banner in Theme Lab when background color changes (address bar updates on panel close).
- **Theme Lab UX Structure**: Added `DERIVED` parent grouping with demoted subheadings; moved hero color rows into derived `TEXT`; moved `textPrimary` into `PRIMARIES`.
- **Theme Lab Control Simplification**: Removed inline hex text inputs from color rows; swatch picker remains for color edits.
- **Theme Lab Header**: Added `BETA` badge in panel header.
- **Theme Lab Copy/Tooltip Refresh**: Updated flash/sticky tooltip wording and simplified instruction copy to match current behavior.

---

## [1.2.0] - 2026-02-26 — Settings Modal & Theme Lab Polish

- **Settings Modal**: Gear icon trigger in mobile header and desktop sidebar; Theme Lab launch, FAB toggle, changelog display (3 recent entries with fold), Welcome Tour stub.
- **Settings Modal A11y**: Focus trap, body scroll lock, `aria-modal`, `aria-hidden` backdrop, Escape key close.
- **Theme Lab Instructions**: Folded instructions section explaining Theme Lab workflow.
- **Theme Lab Mobile**: Bottom sheet layout (50dvh, full width, rounded top edges) for mobile viewports.
- **Theme Lab Transparency**: Reduced background opacity to 50% for better app visibility.
- **Device-Only Labels**: Glow Colors marked "Mobile only", Background Blobs marked "Desktop only" in Theme Lab.
- **Playground DRY**: Theme Lab working copy spreads from Cyprus theme instead of duplicating values.
- **Hex Validation**: `hexToChannels` guards against non-hex color strings.
- **Mobile Gear Fix**: Settings gear button made stateless on mobile (no stuck hover states on iOS).
- **Salary Presets**: `SALARY_PRESETS` extracted from `App.tsx` to `constants.ts`.

---

## [1.1.0-rc.1] - 2026-02-25 — Theme Architecture & Theme Lab

- **Runtime Theme Architecture**: `ThemeProvider` with CSS variable sync, Tailwind semantic tokens (38 colors), `useTheme` hook, Cyprus + Playground theme configs.
- **Theme Lab**: Floating live-editor panel for colors (with family linking), fonts, SVG logo upload, branding text, glow/blob effects, and theme export.
- **SVG Sanitization**: DOMPurify replaces hand-rolled sanitizer for uploaded SVG logos.
- **TypeScript Project References**: `tsc -b` build with `tsconfig.app.json` + `tsconfig.node.json`; prevents emit artifacts.
- **`hexAlpha` Hardening**: Safely handles non-hex color strings (rgba, named colors) instead of producing garbage.
- **New Tests**: `hexAlpha` (5 tests) and `hexToChannels` (4 tests) added to format test suite.
- **CrownLogo Extraction**: Logo component extracted from `App.tsx` into `src/components/CrownLogo.tsx`.

---

## [1.0.0] - 2026-02-24 — Code Quality & Infrastructure

- **Codebase Audit**: Comprehensive 43-finding audit via Warp Oz (GPT-5.3 Codex high); report saved as AUDIT.md.
- **Module Extraction**: Split monolithic App.tsx into `constants.ts`, `types.ts`, `utils/format.ts`, `utils/projection.ts`.
- **MetricCard Component**: Extracted triplicated Target/Growth/Real Value cards into reusable `React.memo` component.
- **Performance Optimization**: `useMemo` on projection calculations, `useCallback` on input handlers, module-scope constants.
- **Unit Tests**: Vitest test suite covering format utilities, projection math, and constants (24 tests).
- **Accessibility**: ARIA labels, landmark roles, skip-to-content, aria-live regions, focus-visible styles, tab semantics.
- **ESLint v9**: Flat config (`eslint.config.js`) with TypeScript + React support; `npm run lint` restored.
- **Meta Tags & SEO**: Description, Open Graph, Twitter Card, apple-mobile-web-app meta tags.
- **Inline Styles Moved**: `<style>` tag contents moved from App.tsx JSX to `index.css`.
- **Tooltip Dismiss**: Tooltips close on tap outside; new tooltips for 401(k) input fields (Contribution %, Match %, Limit %).
- **Versioning**: Retroactive version tags (v0.1.0–v0.9.0) and v1.0.0 release.

---

## [0.9.0] - 2026-02-21 — UX Polish & Copy

- **Loss Panel Responsive Sizing**: Fluid clamp-based font sizes for quote, number, and label across narrow and three-column layouts.
- **Loss Panel Copy**: Quotation marks removed from potential loss dynamic quote.
- **Start-Now Button Layout**: Stacks below heading at cramped viewport widths.
- **Fraction Labels**: Fixed `getLossFractionLabel` — removed `five sixths`; high-ratio labels improved.
- **Stat Icon Radius**: Proportional `rounded-[27%]` replaces fixed `rounded-2xl`.
- **Market Funded Icon**: Swapped `Coins` → `TrendingUp` for better semantic fit.

---

## [0.8.0] - 2026-02-19 — Typography & Drawer Enrichment

- **Custom Font Pairing**: Fraunces (display/headings) + Recursive Sans Linear (UI/body), self-hosted variable woff2.
- **Drawer Handle Stats**: Delayed start age in red, Roth IRA contribution, smart salary formatting ($X.XM).
- **Drawer Handle Glow**: Directional upward glow via `clip-path: inset(-100px -100px 0 -100px)`.
- **iOS Theming**: `theme-color` meta tag and `apple-mobile-web-app-status-bar-style` for dynamic island/address bar.
- **Badge Vertical Centering**: Asymmetric padding for Recursive font metrics.
- **Color Consistency**: Semantic badge variants, loss/error color separation.

---

## [0.7.0] - 2026-02-18 — Visual Identity & Compact Panels

- **Dark Cyprus Palette**: 5-color system — Cyprus #003D3A bg, Persian Green brand, Corn gold, Persian Red loss, Boulder grey OPM.
- **Full Dark Mode**: Solid dark panels, sidebar, header, and inputs throughout.
- **Hero**: Solid carved-text color spans — teal "Dr. Sirkis's", gold "High-Wire Act".
- **Table Waiting Rows**: 3+ delayed years collapse into single vertical age-range summary row.
- **Recharts Tooltip**: Dark styled with matching panel background.
- **Compact Mobile Panels**: Hero+two-across layout for narrow screens; merged Target+Potential Loss in delayed mode.
- **Gold Blobs**: Ambient corner glows (top-right + bottom-right), desktop only.
- **Header Smoothness**: GPU-composited transitions for collapse/expand on mobile scroll.
- **Sirkisms**: 8 new quotes added to the carousel.

---

## [0.6.0] - 2026-02-15 — UI Polish & Responsive Stats

- **Responsive Stats Panels**: Smart per-value abbreviation (4 sig digits), adaptive icon/padding/gap scaling, 3-column threshold at 550px.
- **Chart/Table Padding**: Fixed values matching "The Trajectory" alignment.
- **Chart Tooltip**: Reordered legend to match chart stacking order.
- **Subheadline Fix**: Prevented orphan words with inline-block wrapping.
- **IRS Cap Enforcement**: Contributions exceeding IRS limits clamped in projections (via Warp Oz agent).
- **Title/Meta**: Updated page title and added Open Graph meta tags.
- **Quote Carousel**: "Sirkism" quote carousel for educational reinforcement.
- **Responsiveness**: Enhanced scroll handling, viewport management, and mobile layout.

---

## [0.5.0] - 2026-02-14 — Logic Overhaul

- **Comparisons**: Dual projections for "start now" vs delayed start.
- **Insights**: Potential loss surfaced in metrics and summary panel.
- **Table**: Waiting-period years visually dimmed for clarity.

---

## [0.4.0] - 2026-02-14 — The "High-Wire" Redesign

- **Visual Overhaul**: "Dr. Sirkis's High-Wire Act" branding with glassmorphic UI.
- **Layout**: Desktop-first sidebar with mobile drawer.
- **Typography**: Editorial serif headings.

---

## [0.3.0] - 2026-02-14 — Delayed Start Feature

- **New Input**: "Start investing at" age to quantify delay impact.
- **Insight**: Loss alert module for delayed starts.

---

## [0.2.0] - 2026-02-13 — Granularity Update

- **Breakdown**: Contributions vs employer match vs returns in charts and stats.
- **Inputs**: Slider + text inputs for all parameters.

---

## [0.1.0] - 2026-02-13 — Initial Release

- Core retirement projections with 401(k), Roth, HSA, and inflation-adjusted totals.
