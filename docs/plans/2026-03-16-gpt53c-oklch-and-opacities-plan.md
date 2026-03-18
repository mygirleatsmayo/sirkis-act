# OKLCH + Opacity Normalization Plan (GPT-5.3 Codex in Copilot VS Code Extension)

**Date:** 2026-03-16  
**Branch context:** colors (off new-themes)  
**Scope:** Planning only. No code changes in this document.

## 1) Purpose
Normalize color derivation and opacity usage so the UI remains theme-consistent across dark and light aesthetics, while preserving existing architecture constraints:
- Theme files remain source of truth for runtime colors.
- Derivation logic remains a Theme Lab concern (not hidden during normal theme load/switch).
- Hardcoded white/black alpha styling is replaced by semantic, token-driven styling where appropriate.

## 2) Research-Backed Facts (No Guessing)
Authoritative references reviewed for this plan:
- MDN `oklch()` reference: feature baseline widely available across modern browsers since May 2023; relative syntax available with caveats depending on browser version.
  - https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch
- MDN relative color guide: confirms `from` syntax, channel math behavior, and custom-property-driven relative color workflows.
  - https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Colors/Using_relative_colors
- Can I Use support tables for `oklch()` and relative `oklch` syntax: full modern support with older-browser gaps and partial support histories for relative syntax.
  - https://caniuse.com/mdn-css_types_color_oklch
  - https://caniuse.com/mdn-css_types_color_oklch_relative_syntax
- Tailwind opacity docs: supports numeric opacity utilities and CSS custom-property based opacity (`opacity-(--var)`), which enables semantic opacity control.
  - https://tailwindcss.com/docs/opacity

## 3) Normalize-Skill Discovery Summary
Design-system and architecture alignment inputs from repository:
- Core token model already exists in `ThemeColors`, mapped through CSS variables and Tailwind semantic aliases.
- Derivation currently uses HSL lightness shifting in `src/themes/derivationRules.ts` (`shiftLightness`, `hexToHsl`, `hslToHex`).
- Existing comments already flag future OKLCH revisit for text derivation.
- Significant hardcoded opacity usage exists in app UI surfaces (`App.tsx`, `SettingsModal.tsx`, `Root.tsx`) and heavily in `ThemeLab.tsx`.

Normalization interpretation:
- Production UI should prioritize semantic tokens over hardcoded `white/black + alpha` values.
- Theme Lab may keep its intentionally distinct tooling aesthetic where that is a deliberate product decision, but should still use internal semantic consistency where feasible.

## 4) Current-State Findings (Concrete)
### 4.1 Derivation model friction
- `applyDerivations()` currently depends on HSL shifts for multiple secondary tokens.
- HSL lightness shifts are not perceptually uniform across hues, causing uneven outcomes across varied themes.

### 4.2 Opacity inconsistency hotspots
Representative patterns found:
- `bg-white/10`, `border-white/10`, `bg-black/20`, `text-white/60`, `hover:bg-white/10`, and many variants.
- Hardcoded alpha appears in both semantic-flow UI and tooling UI.

Highest-impact production hotspots:
- `src/App.tsx` (tabs, toggles, table chrome, mobile drawer/header edges, tooltip chrome).
- `src/SettingsModal.tsx` (modal shell, controls, disabled states).
- `src/Root.tsx` (Theme Lab FAB treatment).

High-volume tooling hotspot:
- `src/ThemeLab.tsx` (many fixed white/black-alpha usages).

## 5) Target End State
### 5.1 Color derivation strategy
- Introduce OKLCH-capable derivation utilities for Theme Lab derivation workflows.
- Preserve explicit runtime token ownership in theme files.
- Avoid surprise runtime recoloring when switching themes.

### 5.2 Opacity strategy
- Replace hardcoded white/black alpha in production UI with semantic tokenized surfaces/borders/text states.
- Keep a defined exception policy for intentionally fixed-look tooling surfaces (Theme Lab), documented explicitly.

### 5.3 Accessibility/contrast posture
- Maintain/expand contrast validation for text-on-brand and major surface/text pairings.
- Keep existing contrast fallback pathway compatible with tokenized outcomes.

## 6) Implementation Plan (Phased)
## Phase A: Define Token and Derivation Contract (Design + Spec)
1. Freeze naming conventions for new semantic opacity tokens before coding.
2. Decide token layer split:
   - Base color tokens (theme-authored values).
   - Semantic surface tokens (hover/active/subtle/sunken/highlight).
   - Interaction-state opacity tokens (disabled/faint states).
3. Define which tokens are:
   - Theme-authored only.
   - Theme Lab-derived only.
   - Computed utility outputs (non-persisted helpers).
4. Document exception policy for Theme Lab fixed styling.

Deliverable:
- A small token contract section appended to this plan or follow-up mini-spec before implementation starts.

## Phase B: OKLCH Utility Foundation (No Behavioral Flip Yet)
1. Add OKLCH conversion/adjustment utility design (API-level plan only before code):
   - Hex/RGB <-> OKLab/OKLCH transforms.
   - Safe gamut handling strategy (clip/map policy) and precision policy.
2. Define migration boundary:
   - Start by introducing OKLCH utilities alongside existing HSL helpers.
   - Do not switch all derivations in one commit.
3. Identify first derivation targets for pilot:
   - `bgGlass`, `bgInput`, `borderDefault`, and one text token path.

Deliverable:
- Utility API contract + migration sequence checklist.

## Phase C: Derivation Rule Migration (Controlled)
1. Migrate derivation rules from HSL to OKLCH in slices.
2. Keep textSecondary/textSubtle policy explicit:
   - If still standalone primaries in current architecture, preserve that behavior until explicit product decision to re-derive.
3. Validate mode behavior (dark/light) with same visual intent, not same numeric values.
4. Ensure no derivation runs during normal theme load/switch beyond existing intended pathways.

Deliverable:
- Updated derivation behavior map with before/after expectations per token.

## Phase D: Semantic Opacity Normalization (Production UI First)
1. Inventory and classify hardcoded alpha usage:
   - Replace required in production UI.
   - Keep/adjust only if deliberate exception.
2. Introduce semantic token replacements for common states:
   - Elevated surface tint, sunken surface tint, subtle border tint, muted text state, disabled state, hover wash.
3. Replace hardcoded classes in priority order:
   - `App.tsx` -> `SettingsModal.tsx` -> `Root.tsx`.
4. Defer Theme Lab high-volume cleanup to separate pass after production UI is stable.

Deliverable:
- Replacement matrix mapping old hardcoded patterns to tokenized equivalents.

## Phase E: Theme File and CSS Variable Sync Alignment
1. Update `ThemeColors` contract and all theme definitions to satisfy new semantic tokens.
2. Update CSS variable sync so new tokens flow into Tailwind consistently.
3. Verify Tailwind semantic aliases support intended alpha behavior (`rgb(var(--token) / <alpha-value>)` where applicable).

Deliverable:
- Contract completeness checklist across theme files and sync layer.

## Phase F: Verification and Release Gates
1. Automated checks:
   - Typecheck, lint, tests.
2. Manual visual matrix (required):
   - Themes: Cyprus + Overheated Rhizome.
   - Surfaces: sidebar, chart/table tabs, settings modal, mobile drawer/header.
   - States: default, hover, active, disabled, focus-visible.
3. Contrast checks:
   - text-on-brand controls, subtle text against surface tints, disabled states still readable.
4. Regression checks:
   - Theme switching and Theme Lab open/close/reset flows.

Deliverable:
- Signed verification checklist with pass/fail notes before merge.

## 7) File Touch Map (Planned)
Primary planned implementation targets:
- `src/utils/colorMath.ts` (OKLCH utility additions/migration helpers)
- `src/themes/derivationRules.ts` (HSL -> OKLCH derivation migration)
- `src/themes/types.ts` (token contract expansion)
- `src/themes/syncCssVars.ts` (new semantic tokens)
- `tailwind.config.js` (semantic alias additions if required)
- `src/App.tsx` (production opacity normalization)
- `src/SettingsModal.tsx` (production opacity normalization)
- `src/Root.tsx` (FAB/overlay normalization)
- `src/ThemeLab.tsx` (separate, explicit pass for tool-surface normalization policy)
- `src/__tests__/*` (derivation/color utility and token contract updates)

## 8) Risks and Mitigations
1. Risk: Visual drift across existing themes.
- Mitigation: staged migration with per-theme screenshot checkpoints.

2. Risk: Over-normalizing Theme Lab and losing intended tool affordance style.
- Mitigation: explicit exception policy for tooling surfaces.

3. Risk: Runtime/theme-switch regressions from derivation changes.
- Mitigation: preserve current derivation boundary (Theme Lab-centric), verify with switch/reset matrix.

4. Risk: Token contract bloat.
- Mitigation: add only tokens that map to repeated real usage patterns; avoid one-off tokens.

## 9) Proposed Work Breakdown for Next Execution Session
1. Finalize token contract and exception policy.
2. Implement OKLCH utility layer without activation.
3. Migrate first derivation slice and validate.
4. Normalize production hardcoded opacities by component priority.
5. Run verification matrix and adjust.
6. Decide whether Theme Lab normalization occurs in same PR or follow-up PR.

## 10) Definition of Done
- No hardcoded white/black alpha usage remains in production-facing surfaces unless explicitly approved as exception.
- Derivation path no longer depends on HSL lightness shifts for migrated tokens.
- Theme files remain runtime source of truth.
- Visual/contrast verification passes on Cyprus and Overheated Rhizome.
- Lint/tests/typecheck pass.
