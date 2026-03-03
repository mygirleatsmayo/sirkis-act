# Code Review: `theme-lab-derived` Branch

**Date:** 2026-03-03
**Commits reviewed:** 11 commits (b07e23c through 59a243d + flash fix)
**Files changed:** 17 files, +4543/-1399 lines

## What Was Done Well

- Clean extraction of color math utilities into `src/utils/colorMath.ts` with pure functions and thorough test coverage (35 tests)
- Well-structured derivation engine in `src/themes/derivationRules.ts` with clear separation of primaries, mode statics, and derived tokens
- Token rename migration is complete: no stale references to removed tokens (`bgCard`, `bgMuted`, `textMuted`, `textOnBrand`, `startNowBg`, `neutral`) remain in `src/`
- All 89 tests pass; lint passes with zero warnings
- Lock/unlock system design is sound: absence means locked, explicit `false` means unlocked

## Findings

### Critical (1)

**1. Logo Stroke Color bypasses derivation engine**

- **File:** `src/ThemeLab.tsx`, line 990
- **Description:** The Logo section's "Stroke Color" input uses `setColorAtPath('colors.brand', hex)` instead of `setPrimaryColor('brand', hex)`. This means changing brand color via the Logo section will NOT cascade to the 5 derived tokens (brandBg, focusRing, sliderAccent, sliderAccentHover, heroLine1Color). The Primaries picker correctly uses `setPrimaryColor`, so the two controls for the same value behave differently.
- **Evidence:**
  ```tsx
  // Line 990 — Logo section
  onChange={(hex) => setColorAtPath('colors.brand', hex)}

  // Line 843-844 — Primaries section (correct)
  const handleChange = (hex: string) =>
    isDerivationPrimary ? setPrimaryColor(key as keyof Primaries, hex) : setTextNeutralColor(hex);
  ```

### Important (2)

**2. No contrast guarantee on brand-colored surfaces**

- **File:** `src/SettingsModal.tsx`, lines 169 and 182
- **Description:** The "Beta" badge and "Open Theme Lab" button use `color: theme.colors.textPrimary` on a `backgroundColor: theme.colors.brand` background. On a dark theme, `textPrimary` is white, which happens to work for the current brand color (#00A499). However, if a user creates a light brand color in Theme Lab, `textPrimary` (still white in dark mode) will have poor contrast. The old `textOnBrand` token existed specifically for this case. Now that it's removed, there is no contrast guarantee for text on brand-colored surfaces.
- **Evidence:**
  ```tsx
  // Line 169
  style={{ backgroundColor: theme.colors.brand, color: theme.colors.textPrimary }}
  // Line 182
  style={{ backgroundColor: theme.colors.brand, color: theme.colors.textPrimary }}
  ```

**3. Card and GlassCard now visually identical**

- **File:** `src/App.tsx`, line 57
- **Description:** The `Card` component now uses `bg-surface-glass` (same as `GlassCard`), making the two components functionally identical except for `rounded-[28px]` vs `rounded-[22px]` and different shadow values. This eliminates the visual hierarchy between glass cards and regular cards. The `bgCard` token was removed from the type system, so this may have been intentional, but it means `Card` and `GlassCard` are now nearly indistinguishable.
- **Evidence:**
  ```tsx
  // GlassCard (line 53)
  bg-surface-glass border border-subtle shadow-[0_22px_55px_-38px_rgba(0,0,0,0.8)] rounded-[28px]

  // Card (line 57) — was bg-surface-card, now:
  bg-surface-glass rounded-[22px] border border-subtle shadow-[0_16px_32px_-24px_rgba(0,0,0,0.7)]
  ```

### Minor (3)

**4. Re-derive effect runs on every lock/unlock**

- **File:** `src/ThemeLab.tsx`, lines 456-502
- **Description:** The `useEffect` at line 456 depends on `[effectiveMode, isTokenLocked]`. Since `isTokenLocked` is a `useCallback` that depends on `tokenLocks`, every time any token is locked or unlocked, this effect re-runs and clones the entire theme to re-derive all locked tokens, even if the mode hasn't changed. In practice, unlocking a single token triggers a full re-derivation pass over all tokens. This is not a performance problem at current scale, but it duplicates the derivation work already done in `setPrimaryColor`.
- **Evidence:**
  ```tsx
  useEffect(() => {
    setThemeLocal(prev => {
      const next = cloneTheme(prev);
      const primaries = extractPrimaries(next.colors);
      const derived = applyDerivations(primaries, effectiveMode);
      // ... iterates all tokens
    });
  }, [effectiveMode, isTokenLocked]);  // isTokenLocked changes on every lock/unlock
  ```

**5. Reset defaults always derive from playground, not current primaries**

- **File:** `src/ThemeLab.tsx`, lines 437-452
- **Description:** The `defaults` memo always derives from `playgroundTheme` primaries, not the user's current primaries. This means the reset buttons on derived tokens show the playground-default-derived value, not what the derivation engine would produce from the user's current primaries. If a user changes `brand` to red, the `brandBg` reset button would reset to the playground brand's derived value (teal tint), not the red tint. This is arguably correct (reset = factory default), but it could be confusing since locked tokens show the derived-from-current-primaries value.
- **Evidence:**
  ```tsx
  const defaults = useMemo(() => {
    const d = cloneTheme(playgroundTheme);  // always playground, not current theme
    const primaries = extractPrimaries(d.colors);
    // ...
  }, [effectiveMode]);  // no dependency on current theme primaries
  ```

**6. `derivedCount` hardcoded instead of computed from `DERIVED_PATHS`**

- **File:** `src/ThemeLab.tsx`, lines 837-841
- **Description:** The "N derived" count shown next to each primary is hardcoded as a nested ternary rather than computed from `DERIVED_PATHS[key].length`. If paths are added or removed from `DERIVED_PATHS`, the count will be wrong. Currently all values match, but this creates a maintenance trap.
- **Evidence:**
  ```tsx
  const derivedCount = key === 'bg' ? 3
    : key === 'brand' ? 5
      : key === 'brandAccent' ? 7
        : key === 'startNow' ? 0
          : 1; // returns, loss, opm, textNeutral
  // Could simply be: DERIVED_PATHS[key]?.length ?? 0
  ```

### Nitpick (2)

**7. Delayed-start highlight ring changed from returns (gold) to loss (red)**

- Semantic change: old color (gold/returns) indicated cost-related, new color (red/loss) indicates bad/dangerous. May or may not be intentional UX design.

**8. Legend label "Start Now Total" renamed to "Start Now Difference"**

- Verify the underlying data series actually shows a difference/delta, not an absolute total. If `runProjection` wasn't changed, the label may not match the data.

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| Important | 2 |
| Minor | 3 |
| Nitpick | 2 |
