# Theme Switcher Carousel Design

**Date:** 2026-03-11
**Status:** Review
**Branch:** theme-switcher

---

## Overview

A carousel-based theme switcher inside the Settings Modal. One theme card is expanded (showing full preview) while neighboring cards are folded (showing a vertical distillation). Clicking a folded card expands it with an accordion animation while the previously expanded card folds. Arrow buttons on either side provide wrap-around navigation.

## Card Anatomy

### Shared Constant: Side Panel Width

Both the expanded card's side panel and the folded card use a fixed width of **52px**. This ensures pixel-exact alignment when cards transition between states.

### Expanded Card (175 x 180px, reduced from session 25's 200px to fit carousel)

Two-panel layout inside an outer `motion.div` (with `layout` prop, `rounded-xl`, `border-2`). An **inner wrapper** has `overflow-hidden` + `rounded-xl` to contain content during resize without clipping the outer border/shadow.

- **Side panel** (52px fixed width, bgGlass background):
  - Logo at top (themed color or intrinsic)
  - 4 color swatches (returns, loss, opm, textNeutral) vertically centered below logo via `flex-1 flex items-center justify-center`
  - Swatches: 16px circles with `boxShadow: '0 0 0 1px rgba(255,255,255,0.15)'`

- **Content area** (flex-1, bg background):
  - Theme name line 1: display font, bold, heroLine1Color
  - Theme name line 2: display font, bold, heroLine2Color
  - Flavor text (cardFlavor): sans font, textSecondary, small
  - Mini chart: bgGlass surface with rounded-lg, ThemeCardChart SVG (existing component at top of SettingsModal.tsx, reused as-is)
  - Dollar amount: mono font, tnum feature settings, textPrimary

### Folded Card (52px wide x 180px tall)

Fixed 52px width (matches expanded side panel). Vertical stack:

- **Top zone** (bgGlass background): Logo, scaled down proportionally
- **Rest** (bg background):
  - First letter of theme name word 1 (heroLine1Color, display font, large/bold)
  - First letter of theme name word 2 (heroLine2Color, display font, large/bold)
  - 4 color swatches stacked vertically (same keys as expanded: returns, loss, opm, textNeutral)

### Active Theme Indicator

Applies to both expanded and folded states. Applied on the **outer** `motion.div` (not clipped by the inner overflow wrapper):

- `border-2` in active theme's `brand` color
- `boxShadow: 0 0 0 2px {brand}` for outer glow

## Carousel Layout

### Container Structure

Horizontal flex row with centered content:

```text
Mobile:   [←] [expanded] [folded] [folded] [→]
Desktop:  [←] [expanded] [folded] [folded] [folded] [→]
```

### Responsive Breakpoints

| Viewport           | Visible cards         | Total width estimate                                |
| ------------------ | --------------------- | --------------------------------------------------- |
| Mobile (< 640px)   | 1 expanded + 2 folded | `28 + 175 + 52 + 52 + 28 + gaps(~12) = ~347px`     |
| Desktop (>= 640px) | 1 expanded + 3 folded | `28 + 175 + 52 + 52 + 52 + 28 + gaps(~16) = ~403px`|

Desktop fits within the modal's `max-w-lg` (512px) minus `px-6` (48px) = 464px available. Mobile fits within 375px (iPhone standard). On narrow viewports (< 350px, e.g., iPhone SE at 320px), the carousel should scale down via a `min-width: 0` flex container that allows cards to shrink proportionally rather than overflow.

### Arrow Buttons

- Width: ~28px, full card height (180px)
- Chevron icon (Lucide ChevronLeft/ChevronRight)
- bg-colored with subtle white/10 border
- Always visible; wrap-around navigation (last -> first, first -> last)
- Disabled appearance not needed since they always wrap

## Expand/Fold Transition

### Animation Library

`motion` (free, npm package) via `motion/react` imports.

Only imports needed: `motion`, `AnimatePresence`.

### Mechanism

- Each card is a `motion.div` with `layout` prop
- State: `expandedId: string` tracks which theme card is expanded
- **Initial value:** `expandedId` defaults to the currently active theme ID (`themeId` from `useTheme()`) so the user sees their active theme expanded on open
- On folded card click: set `expandedId` to that theme's ID
- Expanding and folding cards animate simultaneously (both resize in the same frame via `layout`)
- `motion` automatically interpolates width between 52px and 175px via the `layout` prop
- Spring config: `type: "spring", stiffness: 400, damping: 40` (~300ms, critically damped, no overshoot)

### Content Crossfade

- `AnimatePresence mode="wait"`: the exiting content (fold or expand) fades out before entering content fades in
- Exit: opacity 1 → 0 over ~100ms
- Enter: opacity 0 → 1 over ~150ms
- The width transition (via `layout`) runs concurrently with the content crossfade
- `overflow-hidden` is on the **inner wrapper** div (not the outer `motion.div`) to contain content during resize without clipping the active-theme border/shadow

## Carousel Navigation

### State

- `startIndex: number` — index of first visible theme in the window
- `expandedId: string` — which theme is currently expanded
- Window size: `1 + foldedCount` (mobile: 3, desktop: 4)

### Behavior

- Arrow click advances `startIndex` by 1 (right) or -1 (left), wrapping around
- The expanded card stays expanded as the window shifts
- If the expanded card scrolls out of the visible window, the first visible card auto-expands
- Clicking a folded card both expands it and (if needed) keeps the window position stable

## Placeholder Themes

For prototyping with only Cyprus as a real selectable theme, 3 mock themes are defined inline. Each mock provides the minimal surface needed to render both card states.

### Unified Carousel Item Type

Rather than a separate `MockTheme` type, define a `CarouselTheme` interface that is the common surface both real and mock themes provide. Real themes are mapped to this shape via a helper; mocks are defined directly.

```typescript
interface CarouselTheme {
  id: string;
  name: string;                  // two words for folded initials
  isMock: boolean;               // true for placeholder themes (disables selection)
  colors: {
    bg: string;
    bgGlass: string;
    brand: string;
    returns: string;
    loss: string;
    opm: string;
    textNeutral: string;
    textPrimary: string;
    textSecondary: string;
  };
  branding: {
    logo: LogoComponent;
    logoColor: string;
    heroLine1Color: string;
    heroLine2Color: string;
    cardFlavor?: string;
  };
  fonts: ThemeFonts;
}
```

A helper `toCarouselTheme(t: ThemeConfig): CarouselTheme` maps real themes. Mock themes are defined as `CarouselTheme` literals with `isMock: true`.

### Mock Themes

| Name | Palette inspiration | Flavor text | Initials |
| --- | --- | --- | --- |
| Feral Filly | Catppuccin (mauve, pink, teal) | "Pheline Financial" | F F |
| Overheated Rhizome | Warm amber, orange, brown | "Financial Diss...ertation" | O R |
| Eighth Wonder | Deep blue, gold, white | "Relativity Easy" | E W |

Each mock logo is a simple SVG component conforming to `LogoComponent` (`{ className?: string }`):

- **Feral Filly:** Circle with cat-face paths (two triangles for ears, dots for eyes, curved mouth)
- **Overheated Rhizome:** Circle with a root/tuber silhouette
- **Eighth Wonder:** Circle with an "E=mc" text path

These are intentionally rough placeholders, not production logos.

## Component Structure

```text
ThemeSwitcherSection              (owns expandedId, startIndex state)
  ArrowButton (left)              (ChevronLeft, onClick advances left)
  motion.div container            (flex row, gap-2, overflow-hidden)
    ThemeCard x N (visible)       (motion.div with layout prop)
      ExpandedCardContent         (side panel + name + chart + dollar)
      FoldedCardContent           (logo + initials + swatches)
  ArrowButton (right)             (ChevronRight, onClick advances right)
```

### Key Components

- **ThemeSwitcherSection**: Top-level section in SettingsModal. Owns carousel state. Consumes `getSelectableThemes()` + mock themes.
- **ThemeCard**: Receives theme data + `isExpanded` boolean. Renders both content variants; `AnimatePresence` toggles visibility. `motion.div` with `layout` handles width transition.
- **ExpandedCardContent**: Reuses session 25's layout (side panel + content area) with reduced sizing.
- **FoldedCardContent**: New component. Logo zone + initials + swatches.
- **ThemeCardChart**: Existing SVG mini-chart, reused as-is.
- **ArrowButton**: Simple button with chevron icon, full card height.

## Theme Selection

Clicking a folded card does two things:

1. Expands the card visually (sets `expandedId`)
2. Activates the theme (calls `setThemeId`) so the app live-previews it

This means expanding a card = selecting it. The active indicator (brand border) follows the expanded card.

**First render:** On modal open, `expandedId` initializes to the current `themeId`. The expanded card does NOT re-trigger `setThemeId` since it's already active. Only clicking a *different* (folded) card triggers selection.

**Mock themes:** Clicking a mock theme expands it visually but does NOT call `setThemeId` (no real theme to activate). The active indicator stays on the real active theme. This separation means `expandedId` and the active theme can differ when browsing mocks.

## Accessibility

- Carousel container: `role="group"`, `aria-label="Theme switcher"`
- Each card: `<button>` with `aria-label="Switch to {name} theme"` (real themes) or `aria-label="{name} theme (coming soon)"` (mocks)
- Active theme card: `aria-pressed="true"`
- Arrow buttons: `aria-label="Previous theme"` / `"Next theme"`
- Keyboard: arrow left/right within the carousel moves focus between visible cards; Enter/Space activates
- Theme change: no `aria-live` needed since the entire app visually updates as feedback

## Files Changed

| File | Action |
| --- | --- |
| `src/SettingsModal.tsx` | Rewrite ThemeSwitcherSection with carousel; add FoldedCardContent, ArrowButton |
| `package.json` | Add `motion` dependency |

### Files Already in Correct State (on branch)

- `src/themes/types.ts` — `cardFlavor` on ThemeBranding
- `src/themes/index.ts` — `getSelectableThemes()` helper

### No New Files

Mock themes defined inline in SettingsModal. If they grow unwieldy, extract to `src/mockThemes.ts` later.

## New Dependency

```bash
npm install motion
```

- Package: `motion` (v12.x, formerly framer-motion)
- Size: ~30KB gzipped
- Imports: `motion`, `AnimatePresence` from `"motion/react"`
- Tree-shakable; only layout animation + AnimatePresence code is bundled

## Open Questions (Deferred)

- Exact folded card content sizing/spacing (will be tuned during implementation)
- Whether mock themes should live in their own file vs inline
- Swipe/drag gesture support for mobile carousel navigation (can be added later via motion's `drag` prop)
