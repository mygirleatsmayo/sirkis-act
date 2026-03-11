# Theme Switcher UI Design

**Date:** 2025-07-11

## Summary

Add a theme selector to the Settings modal so users can switch between installed themes. The selector reads from the existing theme registry and calls `setThemeId()` for immediate live switching. Theme Lab closes automatically on theme switch.

## Placement

First section in the Settings modal body, above Theme Lab.

## UI: Mini Preview Cards

- Horizontal row of theme cards using `flex flex-wrap`
- Each card is a button (~120x70px) showing:
  - Theme's `bg` color as the card background
  - Theme `name` rendered in the theme's own `textPrimary` color
  - A row of 3-4 small color dots: `brand`, `returns`, `loss`, `opm`
- Active theme gets a `brand`-colored border ring (using the active theme's brand color, not the card's)
- Clicking a card calls `setThemeId(id)`, which triggers an immediate React re-render and localStorage persistence

## Section Header

- Label: "Theme"
- Same styling as other section headers: `text-[11px] font-black uppercase tracking-widest text-content-secondary`

## Filtering

- Hide `playground` (Theme Lab working copy)
- Hide themes where `id` includes `Locked` or `_locked` (QA fixtures)
- All other themes in the registry appear automatically

## Theme Lab Interaction

- Switching themes closes Theme Lab if it's open
- Requires a new prop on `SettingsModal`: callback to close Theme Lab (or signal via shared state)
- The existing `handleOpenThemeLab` flow (Settings closes, then Lab opens) stays unchanged

## Behavior

- Theme applies immediately on selection (no confirm/apply step)
- Settings modal stays open so user sees the modal chrome update with the new theme
- `ThemeProvider` handles localStorage persistence; `playground` ID is never persisted (existing guard)

## Files Changed

| File | Change |
|------|--------|
| `src/SettingsModal.tsx` | Add Theme section with preview cards, add `onCloseThemeLab` prop |
| `src/Root.tsx` | Wire `onCloseThemeLab` callback to SettingsModal |
| `src/themes/index.ts` | Export `themes` record (already exported) and add a `getSelectableThemes()` helper |

## No New Dependencies

Reads from existing `themes` registry and `useTheme()` hook. No new packages.

## Out of Scope

- Theme creation/import UI
- Theme Lab modifications beyond close-on-switch
- Color binding adjustments (user will tune display bindings after seeing the cards)
