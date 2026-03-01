# Theme Lab Derived Colors — Design

**Date:** 2026-02-27
**Branch:** `theme-lab-derived`
**Status:** Approved

---

## Overview

Auto-derive secondary color tokens from primary theme colors in Theme Lab. Default behavior: changing a primary auto-updates all its derived tokens. Users can unlock individual derived tokens for manual override. Harmony color generation stubs included for immediate follow-up work.

## Primaries

6 user-set primary colors (5 with derivations + 1 standalone):

| Primary | Cyprus default | Derived token count |
|---------|---------------|-------------------|
| `bg` | #003D3A | 5 (bgGlass, bgCard, bgInput, bgMuted, borderDefault) |
| `brand` | #00A499 | 5 (brandBg, focusRing, sliderAccent, sliderAccentHover, heroLine1Color) |
| `returns` | #E6C300 | 8 (returnsBg, heroLine2Color, glow×3, blob×2, startNowBg*) |
| `loss` | #D32F2F | 1 (lossBg) |
| `startNow` | #0D9488 | 1 (startNowBg) |
| `opm` | #A8A8A8 | 0 (standalone) |

*startNowBg derives from startNow, not returns.

## Derivation Rules

### From `bg`

| Derived token | Rule | Cyprus value |
|--------------|------|-------------|
| bgGlass | +2% lightness | #004745 |
| bgCard | +1% lightness | #004240 |
| bgInput | -3% lightness | #002E2B |
| bgMuted | bg at alpha 0.6 | rgba(0, 61, 58, 0.6) |
| borderDefault | +12% lightness | #006560 |

Lightness offsets flip sign in light mode.

### From `brand`

| Derived token | Rule | Cyprus value |
|--------------|------|-------------|
| brandBg | brand at alpha 0.06 | rgba(0, 164, 153, 0.06) |
| focusRing | copy | #00A499 |
| sliderAccent | copy | #00A499 |
| sliderAccentHover | -5% lightness | #0D9488 |
| heroLine1Color | copy | #00A499 |

### From `returns`

| Derived token | Rule | Cyprus value |
|--------------|------|-------------|
| returnsBg | returns at alpha 0.08 | rgba(230, 195, 0, 0.08) |
| heroLine2Color | copy | #E6C300 |
| glowColors[0] | returns at alpha 0.50 | rgba(230, 195, 0, 0.50) |
| glowColors[1] | returns at alpha 0.32 | rgba(230, 195, 0, 0.32) |
| glowColors[2] | returns at alpha 0.20 | rgba(230, 195, 0, 0.20) |
| blobs[0].color | returns at alpha 0.10 | rgba(230, 195, 0, 0.10) |
| blobs[1].color | returns at alpha 0.05 | rgba(230, 195, 0, 0.05) |

### From `loss`

| Derived token | Rule | Cyprus value |
|--------------|------|-------------|
| lossBg | loss at alpha 0.07 | rgba(211, 47, 47, 0.07) |

### From `startNow`

| Derived token | Rule | Cyprus value |
|--------------|------|-------------|
| startNowBg | startNow at alpha 0.08 | rgba(13, 148, 136, 0.08) |

### Mode-dependent statics

These flip based on dark/light mode selection, not derived from any primary:

| Token | Dark | Light |
|-------|------|-------|
| bgOverlay | rgba(15, 23, 42, 0.4) | rgba(15, 23, 42, 0.4) |
| borderSubtle | rgba(255, 255, 255, 0.06) | rgba(0, 0, 0, 0.06) |
| textPrimary | #ffffff | #0f172a |
| textSecondary | #e2e8f0 | #334155 |
| textMuted | #cbd5e1 | #64748b |
| textSubtle | #94a3b8 | #475569 |
| textOnBrand | #ffffff | #ffffff |
| neutral | rgba(255, 255, 255, 0.10) | rgba(0, 0, 0, 0.10) |
| toggleOff | #cbd5e1 | #94a3b8 |
| scrollbarThumb | rgba(148, 163, 184, 0.3) | rgba(100, 116, 139, 0.3) |
| scrollbarThumbHover | rgba(148, 163, 184, 0.5) | rgba(100, 116, 139, 0.5) |

## Theme Lab UX

### Primaries section (replaces Color Families)

- 6 primary color pickers at top of Theme Lab
- Each primary shows derived count badge (e.g., "5 derived")
- Reset button per primary: resets primary to default; locked derived tokens also reset, unlocked stay
- **Dark | Light | Auto** three-way mode toggle
  - Dark (default): mode-dependent statics use dark values
  - Light: mode-dependent statics use light values
  - Auto: detects from `relativeLuminance(bg)` threshold 0.5

### Derived token behavior

- **Locked (default):** color picker is non-interactive (dimmed, no pointer). Small lock icon indicates managed state. Changing the parent primary auto-updates this token.
- **Unlocking:** user clicks unlock icon button on the derived token. Picker becomes interactive. Token detaches from primary.
- **Re-locking:** reset button on an unlocked derived token snaps it back to derived value and re-locks.
- **Full reset:** resets entire theme, all tokens re-lock.

### Flash/highlight feature

Clicking a token name temporarily flashes all DOM elements consuming that CSS variable:
1. Save current CSS var value
2. Set var to high-contrast flash color (white or outline)
3. setTimeout 200-300ms, restore original
4. For primaries with locked derivations: flash primary + all derived tokens together

### Export

Exported theme files contain final resolved values (all tokens explicit). No derivation rules in the export. Exported themes work as standalone prebuilt themes.

## File Structure

### New files

| File | Purpose |
|------|---------|
| `src/utils/colorMath.ts` | Pure functions: hex↔rgb↔hsl, alpha overlay, relative luminance, HSL shift. Harmony stubs: analogous(), triadic(), tetradic(), complementary() |
| `src/themes/derivationRules.ts` | Rule map, `applyDerivations(primaries, mode)`, mode-dependent static lookup |

### Modified files

| File | Change |
|------|--------|
| `src/ThemeLab.tsx` | Replace Color Families with Primaries section; lock/unlock state per derived token; forced-unlock UX; flash feature; dark/light/auto toggle |

### Unchanged files

- `src/themes/types.ts` (ThemeConfig interface unchanged)
- `src/themes/syncCssVars.ts`
- `src/themes/cyprus.ts`, `playground.ts`, `index.ts`

## Testing

- `src/__tests__/colorMath.test.ts`: HSL roundtrip accuracy, alpha generation, luminance calculation, harmony functions
- `src/__tests__/derivationRules.test.ts`: Cyprus inputs produce Cyprus outputs exactly; light mode statics correct; individual rule validation

## Harmony (follow-up, possibly same branch)

`colorMath.ts` exports harmony functions from day one:
- `analogous(hex, count)`: ±30° hue rotation
- `triadic(hex)`: ±120° hue rotation
- `tetradic(hex)`: 90° intervals
- `complementary(hex)`: 180° hue rotation

These are pure functions with no UI. Follow-up work wires them into Theme Lab as a "Generate palette from one color" feature where harmony outputs populate the 5 primaries.
