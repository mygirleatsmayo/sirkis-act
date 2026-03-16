# Theme Compatibility and Design Lockdown

**Date:** 2026-03-14  
**Branch:** `new-themes`  
**Status:** In Progress  
**Companion Doc:** [2026-03-13-feral-filly-and-overheated-rhizome-design.md](docs/plans/2026-03-13-feral-filly-and-overheated-rhizome-design.md)

## Why This Doc Exists
This document is the compatibility source of truth for theme work on `new-themes`.  
Its purpose is to ensure new themes can be designed and refined without hidden runtime conflicts, reset instability, or cross-branch merge surprises.

It records:
- What changed
- What was reverted
- What architecture is now locked
- What must be verified before compatibility can be considered stable

## Scope
Included:
- Theme compatibility blockers
- Overheated implementation/change timeline
- Token-vs-runtime architecture boundaries
- Verification matrix for compatibility safety

Excluded:
- New features not required for compatibility closure
- Visual polish not tied to compatibility risk

## Locked Decisions
1. **Brand-surface text strategy is Option C**:
- Explicit token intent for text on brand surfaces
- Runtime contrast fallback when token choice is unsafe

2. **Decision-loop rule is mandatory for theme-system behavior changes**:
- Contrast/token logic changes require explicit alignment before implementation

3. **Responsibility boundary is explicit**:
- Theme layer owns token/derivation/fallback policy
- UI layer consumes resolved values consistently

## Current Snapshot
Relevant implementation files:
- [src/themes/overheatedRhizomeLight.ts](src/themes/overheatedRhizomeLight.ts)
- [src/themes/index.ts](src/themes/index.ts)
- [src/themes/derivationRules.ts](src/themes/derivationRules.ts)
- [src/ThemeLab.tsx](src/ThemeLab.tsx)
- [src/themes/ThemeProvider.tsx](src/themes/ThemeProvider.tsx)
- [src/App.tsx](src/App.tsx)
- [palette-explorer.html](palette-explorer.html)

## Overheated Timeline (Chronological)

### 2026-03-13: Design and Palette Direction
- Created/iterated Overheated palette exploration in [palette-explorer.html](palette-explorer.html)
- Updated semantic labels in explorer output (Growth, Employer Funded, Real Value naming pass)
- Captured narrative design decisions in [2026-03-13-feral-filly-and-overheated-rhizome-design.md](docs/plans/2026-03-13-feral-filly-and-overheated-rhizome-design.md)

### 2026-03-13 to 2026-03-14: Runtime Theme Wiring
- Added new theme definition in [src/themes/overheatedRhizomeLight.ts](src/themes/overheatedRhizomeLight.ts)
- Registered theme in [src/themes/index.ts](src/themes/index.ts)
- Set Overheated editor mode to manual-derivation default (`studioNoDerivation`) to avoid immediate auto-mutations at open

### 2026-03-14: Compatibility Stabilization
- Added Theme Lab re-derive guard in [src/ThemeLab.tsx](src/ThemeLab.tsx) so closed panel state does not trigger hidden re-derive churn
- Added theme selection precedence protection in [src/themes/ThemeProvider.tsx](src/themes/ThemeProvider.tsx):
- Explicit theme selection clears transient Theme Lab override

### 2026-03-14: App Toggle Text Experiment and Rollback
- Experimental selected-label behavior was tested in [src/App.tsx](src/App.tsx) using contrast-switch logic
- Experiment was reverted due coupling concerns and decision-loop mismatch
- Current selected Chart/Table label behavior still requires final Option C architecture implementation

## Applied vs Reverted Change Ledger

### Applied and Kept
1. [src/themes/ThemeProvider.tsx](src/themes/ThemeProvider.tsx)
- `setThemeId` clears transient override
- Prevents stale override from masking selected theme
- Improves theme switch reliability without reload

2. [src/ThemeLab.tsx](src/ThemeLab.tsx)
- Re-derive effect now gated by `isOpen`
- Prevents hidden mutation before/after panel interaction

3. [src/themes/overheatedRhizomeLight.ts](src/themes/overheatedRhizomeLight.ts)
- `editor.kind` set to `studioNoDerivation`
- Keeps authored colors stable on first open unless user opts into derivation

4. [src/themes/index.ts](src/themes/index.ts)
- Overheated theme added to runtime registry

### Reverted/Not Accepted as Final
1. [src/App.tsx](src/App.tsx)
- Contrast-switching selected label logic over brand surfaces
- Reverted because behavior was introduced before explicit alignment and created cross-token coupling risk

## Compatibility Findings from TODO (L13-98)

Source: [sirkis-act-TODO.md](sirkis-act-TODO.md)

### Compatibility-Critical (P0)
1. Brand toggle/button label color token and/or math solution
2. Multiline disclaimer attribution footer plus capability flag support
3. Desktop sidepanel border handling consistency (`borderSubtle` expectation)
4. Light/dark mode refinement with clear token influence rules
5. Pre-baked light/dark compatibility path for themes
6. Derivation system completeness where compatibility depends on predictable outcomes

### Compatibility-Adjacent (P1)
1. Accent token semantic naming consistency
2. Save/export mechanism reliability for generated themes
3. Theme switcher descriptive text for selected theme and mode language
4. Theme Lab background behavior in mode toggle
5. Font strategy consistency for theme portability

### Non-Blocking for Compatibility Closure (P2)
1. Layout rearrangements in Theme Lab
2. Onboarding/walkthrough UX
3. Edited-token visual indicator affordances
4. Advanced logo animation features
5. Optional foldable sections

## Architecture Target State

### Theme Layer Responsibilities
- Define semantic token contracts
- Resolve derived tokens from primaries
- Provide explicit token intent for text on brand surfaces
- Provide centralized fallback logic for contrast safety

### UI Layer Responsibilities
- Consume resolved token values
- Avoid per-component ad hoc contrast rules
- Use one shared selected/active brand-surface text resolver path

### Option C Contract
- Primary path: explicit token intent (`text-on-brand` behavior)
- Fallback path: runtime contrast helper if explicit token fails contrast threshold
- Result: predictable theming with safety for extreme/light brand values

## Verification Matrix

### Theme Switch Integrity
1. Select non-playground theme from Settings
2. Confirm override is cleared
3. Confirm selected theme fully applies without reload

### Theme Lab Stability
1. Open Theme Lab from each target theme
2. Confirm no immediate color mutation before input interaction
3. Toggle derivation on/off and verify expected behavior only when enabled

### Brand-Surface Readability
1. Validate selected/active controls on `brand` backgrounds
2. Validate in Cyprus and Overheated
3. Validate with high-contrast light and dark brand cases

### Reset Semantics
1. Global reset determinism
2. Token reset determinism
3. Theme switch after resets does not preserve stale override state

### Minimum Compatibility Matrix
- Cyprus: Chart, Table, Settings, Theme Lab open/close, reset
- Overheated: Chart, Table, Settings, Theme Lab open/close, reset

## Risks and Guardrails

### Risks
1. Hidden coupling from ad hoc component-level contrast logic
2. Transient override precedence regressions
3. Token drift between derivation policy and UI usage

### Guardrails
1. No hardcoded runtime state colors for selected/active semantics
2. Decision-loop required for theme-system behavior changes
3. Shared resolver contract for brand-surface text behavior

## Immediate Next Actions
1. Implement full Option C path in theme architecture
2. Apply shared resolver to all selected/active brand-surface controls
3. Run compatibility matrix and record outcomes
4. Close or reclassify P0 TODO items with explicit pass/fail notes
5. Keep this document updated as the compatibility ledger of record

## Cross-References
- [2026-03-13-feral-filly-and-overheated-rhizome-design.md](docs/plans/2026-03-13-feral-filly-and-overheated-rhizome-design.md)
- [sirkis-act-TODO.md](sirkis-act-TODO.md)
- [src/themes/derivationRules.ts](src/themes/derivationRules.ts)
- [src/themes/ThemeProvider.tsx](src/themes/ThemeProvider.tsx)
- [src/ThemeLab.tsx](src/ThemeLab.tsx)
- [src/App.tsx](src/App.tsx)
- [src/themes/index.ts](src/themes/index.ts)
- [src/themes/overheatedRhizomeLight.ts](src/themes/overheatedRhizomeLight.ts)
- [palette-explorer.html](palette-explorer.html)
