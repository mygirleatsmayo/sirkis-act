# Wave 3 Merge-Readiness Plan (Theme Readiness Only)

## Summary
Finalize this branch for merge by completing the remaining theme-readiness blockers from TODO, with implementation staying on this branch (timing flexible).  
This scope excludes unrelated app features and full Theme Lab capability-layout reorg.

## Implementation Changes

### 1) Projection Color Decoupling (Full Split)
- Add dedicated projection primaries so projection visuals are not coupled to `brand`.
- New code-level tokens:
  - `target`, `targetBg`
  - `selfFunded`, `selfFundedBg`
- Keep existing keys for compatibility where appropriate:
  - `returns`, `opm`, `startNow`
- Rewire projection UI/chart usage:
  - Target card/badge/target visuals consume `target`.
  - “Your Contributions” visuals consume `selfFunded`.
  - Employer/Growth/Start-Now remain on existing keys.

### 2) Text Policy Implementation
- Implement `textSecondary` + `textSubtle` as mode-aware derivations from `textPrimary`.
- Keep manual override path via existing lock/unlock behavior in Theme Lab.
- Remove static mode constants for these two tokens from derivation rules.

### 3) Glow Model
- Theme Lab exposes one general glow color token.
- Internal 3 glow values remain, derived from that single token via fixed opacities.
- Add separate `startNowGlow` token for Add Start-Now glow behavior.
- Start-Now glow applies only in Add state.

### 4) Reintroduce `mutedBg`
- Add `mutedBg` to theme contract/defaults.
- Wire to:
  - subcards
  - table background container
  - delayed table start-age row background (when delayed mode is active)

### 5) Numeric Typography Contract
- Standardize numeric UI to `mono.text` by default.
- Restrict `mono.tabular` to:
  - projection table
  - chart tooltip numeric values

### 6) Focus Ring Clarification
- Keep `focusRing` as canonical focus-visible ring token.
- Add concise comment/help clarification in Theme Lab/docs.

### 7) Theme Lab Naming (No Broad Key Renames)
- Keep code keys stable to reduce risk.
- Update Theme Lab labels only:
  - `returns` → **Growth**
  - `opm` → **Employer Funded**
  - `textNeutral` → **Real Value**
  - matching BG labels similarly.

## Public Interface / Type Changes
- Extend `ThemeColors` with:
  - `target`, `targetBg`
  - `selfFunded`, `selfFundedBg`
  - `mutedBg`
  - `startNowGlow` (or equivalent explicit key)
- Preserve backward compatibility for existing themes via resolver defaults.

## Test Plan

### Unit Tests
- Derivation tests for:
  - new projection tokens
  - text derivation from `textPrimary`
  - glow single-source derivation + `startNowGlow`
  - `mutedBg` defaults
- Resolver compatibility tests for themes missing new keys.
- Token wiring tests for chart/cards/table/start-now behavior.

### Manual QA
- Theme Lab:
  - new projection tokens visible + flash correctly
  - renamed labels map to correct behavior
  - single glow token drives glow ramp
  - start-now glow isolated to Add state
- App:
  - projection visuals no longer shift when only `brand` changes
  - mutedBg applies only to intended surfaces
  - numeric typography contract holds (table/tooltip tabular only)
- Regression:
  - subhead behavior, disclosures placement, reset icon state remain stable

## Deferred Post-Merge
- Capability controls placement reorg in Theme Lab.
- Optional per-token mode influence toggles.
- User-adjustable derivation math UI.
- Theme-save backend workflow enhancements.

## Context Notes (for post-compaction continuity)
- Current branch: `theme-design-compatibility`.
- Recently completed and validated:
  - Wave 1 + Wave 2 compatibility/hardening
  - subhead emphasis model (`plain|bold|italic|boldItalic`)
  - subhead wrap + widow controls
  - desktop disclosures moved to sidebar footer
  - Theme Lab reset-button false-active issue fixed and revalidated
- Outstanding merge blockers are Wave 3 items above (token decoupling, text derivation policy implementation, glow model split, mutedBg, numeric typography contract).
- User preference decisions already locked:
  - scope = theme readiness only
  - implementation remains on this branch
  - text derivation = mode-aware from `textPrimary` + override
  - glow = single general glow token + separate Start-Now glow token
  - projection = full split (with semantic Theme Lab label updates)
  - mutedBg wiring = subcards + table bg + delayed start-age row
  - capability reorg + mode influence toggles + derivation-math customization deferred
