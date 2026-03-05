# Theme Design Compatibility — Design

**Date:** 2026-03-05  
**Branch:** `theme-design-compatibility`  
**Status:** Approved

---

## Overview

Prepare the app for parallel theme design without schema drift or Cyprus-specific coupling.

Core direction:
- Keep one `ThemeConfig` schema.
- Keep all visual tokens fully per-theme and overridable.
- Treat derivation/locks as Theme Lab editing mechanics, not a runtime requirement.
- Make optional branding/content behavior explicit via capabilities.
- Keep disclosure app-global (not theme-scoped), implemented as a lightweight popover.

---

## Goals

- Enable multiple new themes to be developed in parallel safely.
- Preserve full color/token override freedom for theme authors.
- Support themes with fewer branding/content elements (no carousel, no hero line 2, etc.).
- Support non-colorable logos (intrinsic PNG/SVG behavior) for brand-locked themes.
- Keep Theme Lab usable while allowing non-editable preinstalled themes.

## Non-Goals

- Rewriting Theme Lab architecture.
- Building component-level render tests in this pass.
- Theme-scoped legal disclaimer content.

---

## Key Decisions

1. **Cyprus remains the Studio reference theme** and should be taken fully to that model.
2. **All theme colors/tokens remain explicitly overridable per theme** (no forced derivation lock-in at runtime).
3. **New Studio themes default `showSirkisms=false`** unless intentionally built from Cyprus/Overheated-Rhizome style content.
4. **Disclosure is app-global**, not theme capability and not Theme Lab editable.
5. **CCP-style themes are brand-locked** and may be non-Theme-Lab-editable and use intrinsic logos.

---

## Theme Contract

### 1) Single schema with resolved runtime defaults

Add a normalization layer:
- `resolveTheme(theme)` returns an effective theme object used by runtime.
- Responsibilities:
  - fill capability defaults,
  - fill editor metadata defaults,
  - preserve explicit visual tokens unchanged.

This keeps render logic simple and prevents missing-field drift across themes built in parallel.

### 2) Visual tokens remain first-class and explicit

- `colors`, `fonts`, `effects`, `branding` stay explicit in theme files.
- Derivation remains an editor convenience, not a runtime requirement.
- A developer can set combinations like white `textPrimary` + purple `textSecondary` intentionally.

### 3) Capability flags (initial)

Theme-level optional content/layout flags:
- `showLogo`
- `showTagline`
- `showHero`
- `showHeroLine2`
- `showSubhead`
- `showSirkisms`
- `subheadMode`: `structured | plain`
- `logoColorMode`: `themed | intrinsic`

Defaults are resolved centrally and tested.

### 4) Editor metadata

Theme metadata controls Theme Lab participation:
- `editor.kind`: `studio | locked`

Behavior:
- `studio`: editable in Theme Lab.
- `locked`: excluded from Theme Lab editing controls.

No `template` class in this phase.

---

## Disclosure UX (App-Global)

### Content

Single global copy:

> "The information provided on this website is for educational purposes only and should not be construed as investment or financial advice."

### Interaction model

- Present as a subtle link-like trigger (`Investing Disclosure`), not a heavy modal flow.
- Open a compact popover with full copy immediately (no extra “read more” step).
- Close on outside click/tap, Escape, and re-trigger.

### Placement

- **Desktop:** top-right of main app content.
- **Mobile:** inside the opened drawer, opposite the Timeline heading.
- Not shown in collapsed drawer handle.

### Theming

- Reuse existing surface/text tokens (`bgGlass`, `textPrimary`, etc.).
- No new disclaimer-specific theme tokens.

---

## Rendering/Data Flow

1. `ThemeProvider` supplies selected theme.
2. Runtime resolves `effectiveTheme = resolveTheme(theme)`.
3. `App.tsx` gates optional blocks via `effectiveTheme.capabilities`.
4. Theme Lab uses editor metadata to determine editability.
5. Disclosure state is app-local UI state, independent of theme config.

---

## Testing Strategy

Add/expand tests around pure logic and invariants:

- `resolveTheme` defaults/override behavior.
- Theme registry/schema invariants:
  - required visual token presence,
  - capability defaults safely applied when omitted,
  - locked themes valid with intrinsic logo mode.
- Existing quality gates remain required:
  - `npm run lint`
  - `npm run test`
  - `npm run build`

No new component integration harness is required for this phase.

---

## Rollout Plan (High-Level)

1. Introduce contract additions (`capabilities`, `editor` metadata, resolver).
2. Wire `App.tsx` render guards to resolved capabilities.
3. Restrict Theme Lab editing to `studio` themes.
4. Add disclosure link + popover in responsive placements.
5. Add/adjust tests and run full verification.

---

## Risks and Mitigations

- **Risk:** contract drift from parallel theme authoring.
  - **Mitigation:** central `resolveTheme` + schema invariant tests.
- **Risk:** accidental loss of Theme Lab flexibility.
  - **Mitigation:** keep visual tokens fully explicit/overridable; limit only editability by theme class.
- **Risk:** legal copy becoming theme-coupled again.
  - **Mitigation:** keep disclosure global and out of theme capabilities.

---

## Acceptance Criteria

- Themes with missing optional content render cleanly (no broken assumptions).
- Studio themes remain fully editable in Theme Lab.
- Locked themes are visible/usable at runtime but not editable in Theme Lab.
- Disclosure appears in agreed desktop/mobile locations and behaves as popover.
- Lint/tests/build pass with no warnings/errors.

