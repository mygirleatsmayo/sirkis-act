# Theme Design Compatibility Readiness Audit

Date: 2026-03-04
Branch context: `theme-lab-derived`

## Why this note exists
Goal: identify what should be settled before multiple agents design new themes in parallel, so later planned changes do not break theme compatibility.

## Scope reviewed
- TODO sections:
  - `Inbox`
  - `Themes & Branding`
- Current theme/runtime contract in:
  - `src/themes/types.ts`
  - `src/themes/derivationRules.ts`
  - `src/themes/themeLabDerivation.ts`
  - `src/App.tsx`
  - `src/ThemeLab.tsx`

## Key finding
Parallel theme design is safe only if we either:
1) freeze and enforce the current contract, or
2) first implement a small compatibility layer for optional branding/layout elements.

Given planned theme variety (fewer/missing elements, possibly non-colorable logos), option (2) is the safer long-term path.

## Open TODO items that are relevant before parallel theme design

### Potential blockers / high-impact design dependencies
1. `are textSecondary and textSubtle derived from textPrimary? if not, should they be?`
2. `Refine light/dark mode functionality and logic`
3. `Some branding/copy elements/effects need to be optional`
   - `subhead emphasis`
   - `Sirkisms carousel`
4. `FEAT: upgraded mechanism for users to save themes`
5. `Theme switcher UI in Settings` (if designers expect user-facing theme selection)

### Lower-impact (not blockers for starting design)
1. `Add subtle glow ... Add Start-Now button`
2. `Toggle debossed effect`
3. `MAYBE: foldable sections`
4. `focusRing control` clarity
5. `Reintroduce mutedBg token` and other visual refinements

## Additional compatibility risks not explicitly called out in TODO
1. **Branding fields are currently effectively required by rendering assumptions**
   - App always renders logo, tagline, hero lines, subhead block, and quote carousel container.
   - `ThemeBranding` requires all fields.
2. **Subheadline emphasis assumes structured parts**
   - `heroSubheadParts` is required in types and used for bold span rendering.
3. **Sirkisms are global constants, not theme-scoped**
   - Themes cannot currently disable or replace quote behavior cleanly.
4. **Logo colorability assumption**
   - Theme model assumes `branding.logoColor` is applicable.
   - Non-colorable logos (intrinsic colors / raster / locked fill) need a contract.
5. **ThemeLab export contract stability**
   - If theme schema changes after agents create theme files, generated files can drift.

## Recommended pre-parallel hardening (minimal viable)
These are the smallest changes that materially reduce breakage risk:

1. **Freeze ThemeConfig v1 contract in writing**
   - Decide now whether designers must include all current branding fields.
   - Document this in a short “Theme Authoring Contract” note.

2. **Decide text system policy now**
   - Keep current: `textPrimary` and `textNeutral` are primaries; `textSecondary`/`textSubtle` mode-static.
   - Or change to derivation from `textPrimary`.
   - Do not start parallel theme work until this is decided.

3. **Add explicit optionality controls before themes needing fewer elements**
   - Add theme-level visibility/config flags (example):
     - `showHero`
     - `showHeroLine2`
     - `showSubhead`
     - `showSirkisms`
     - `heroSubheadEmphasisMode` (`structured` | `plain`)
     - `logoColorMode` (`themed` | `intrinsic`)

4. **Add compatibility smoke tests for all theme objects**
   - Runtime render test: each theme mounts without missing required data.
   - Schema test: each theme satisfies current contract and optional flags.

## If no hardening is done first
Parallel design can still proceed, but only under a strict temporary rule:
- Every new theme must follow the current full Cyprus-shaped contract:
  - colorable logo
  - two-line hero
  - subhead parts available
  - Sirkisms tolerated in UI

Any theme designed outside this rule is likely to need rework.

## Recommended decision gate before parallel design starts
1. Confirm text derivation policy (`textSecondary`/`textSubtle` question).
2. Decide whether reduced-element themes are in scope for this next design round.
3. If yes, implement optional branding/layout flags first.
4. Then start parallel theme design.
