# Code Review: theme-design-compatibility branch

**Date:** 2026-03-10
**Range:** `e9c569a..3d202bf` (15 commits, 34 files, ~2400 ins / ~340 del)
**Verdict:** Ready to merge (merged)

---

## Strengths

- Clean architecture: theme definition → resolution → derivation → lab helpers, each with single responsibility
- `ResolvedThemeConfig` vs `ThemeConfig` enforces type safety (partial config vs fully resolved)
- 133 tests across 9 files; tests validate actual derivation math, not mocks
- Legacy compat: `showHero` → `showHeroLine1`, `structured` → `bold` migrations handled gracefully
- Locked theme enforcement has multiple defense layers (Root, SettingsModal, registry filter)
- Glow color consolidation to single `glowColor` with `color-mix()` is elegant
- Branding utilities (`src/utils/branding.ts`) are pure, testable, edge-case aware
- LabTooltip replaces native `title` (no mobile interaction) with proper touch handling

## Issues

### Important (non-blocking)

1. **Unused `_subheadMode` param** — `src/utils/branding.ts:52`
   - Accepted but never read; emphasis styling handled in App.tsx via `emphasisClassName`
   - Either remove param from `resolveSubhead` + callers, or document why it exists

2. **Playground `logoColorMode: 'intrinsic'`** — `src/themes/playground.ts:12`
   - Differs from Cyprus source (`'themed'`); logo color picker disabled by default in Theme Lab
   - Confirm intentional or clone from source theme

3. **No explicit `studioNoDerivation` test** — `src/__tests__/themeRegistry.test.ts:11`
   - Registry regex `/studio|locked/` matches as substring, but no test creates this kind directly
   - Add a `resolveTheme.test.ts` case for `editor: { kind: 'studioNoDerivation' }`

### Minor

4. **`cloneTheme` duplicated** between `themeLabDerivation.ts` and `ThemeLab.tsx`
   - Export from one place to prevent drift

5. **Capabilities toggle buttons** in ThemeLab repeat identical Tailwind patterns (12+ elements)
   - A `ToggleButton` sub-component could reduce repetition

6. **`getSelectableThemes` uses string matching** — `src/themes/index.ts:20`
   - `includes('locked')` would hide a theme named "Unlocked Edition"
   - Consider filtering on `editor.kind === 'locked'` instead
