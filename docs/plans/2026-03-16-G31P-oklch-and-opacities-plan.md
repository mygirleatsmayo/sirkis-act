# OKLCH & Semantic Opacities Normalization Plan

**Goal**: Execute a complete UI normalization targeting hardcoded opacities and rigid color derivations, ensuring the app seamlessly adapts across highly varied visual themes while honoring our "No AI Slop" and "Varied but Consistent" design principles.

## 1. Discover: The Design Context
As established in `CLAUDE.md`, the Sirkis Act design system mandates:
- **Varied but Consistent**: A stable, highly readable core layout that adapts gracefully to completely different aesthetics (e.g., dark glassy "Cyprus" vs light playful "Overheated Rhizome").
- **Intentional Craft**: No generic "AI slop" or assumptions. Color choices, including opacities and subtle contrasts, must be explicitly authorable by the theme.

## 2. Analyze: Current Feature Deviations
**The Problems:**
1. **Hardcoded Tailwind Opacities**: Elements across the app (like SettingsModal, input overlays, hovered toggles) rely on hardcoded `/10`, `/20`, or specific colors like `bg-white/10` and `bg-black/20`. 
   - *Impact*: Breaks light themes (black backgrounds turn muddy; white text overlays turn invisible). Forces a glassy/dark bias onto all themes.
2. **HSL Perceptual Imbalance**: The derivation engine uses `shiftLightness` via HSL. HSL is not perceptually uniform. Shifting a yellow by 5% creates a vastly different contrast step than shifting a blue by 5%.
   - *Impact*: Themes with bright or unexpected brand colors require massive manual adjustment to remain legible.
3. **Static Text Fallbacks**: `textSecondary` and `textSubtle` are treated as static standalone values because HSL derivation failed to provide consistent contrast.

## 3. Plan: Normalization & System Alignment
To align with the design system's flexibility goals, we must systematically remove all fixed opacity classes (`/[0-9]+`) and hardcoded mode colors (`white/black`), replacing them with structural CSS variables powered by a perceptually uniform OKLCH engine.

### Phase 1: OKLCH Core Engine
Replace fragile HSL math with a lightweight, native OKLCH implementation in `src/utils/colorMath.ts` (zero external dependencies).
- `hexToOklch(hex) -> [L, C, H]`
- `oklchToHex(L, C, H) -> hex`
- `shiftOklchLightness(hex, deltaL) -> hex`
- `deriveOklchText(bgHex, targetL) -> hex` (Extracts Hue & Chroma from the background, clamps Chroma, and sets precise L for perceptually identical secondary text on any theme).

### Phase 2: Theme Token Expansion
Expand the `ThemeColors` interface to include explicit interaction and surface tokens so themes control their own depth and hover states:
- **Interactions:** `surfaceHover`, `surfaceActive`
- **Surfaces:** `surfaceHighlight` (replaces `bg-white/10`), `surfaceSunken` (replaces `bg-black/20`)
- **Borders:** `borderMuted` (replaces `border-white/10`)
- **Opacities (Optional/Hybrid):** Standardize a `--opacity-glass` variable mapped to `bg-surface-glass/[var(--opacity-glass)]` if raw alpha flexibility is preferred over mixed colors.

### Phase 3: Execute (Component Normalization)
Systematically audit `App.tsx`, `SettingsModal.tsx`, and `ThemeLab.tsx`.
- **SettingsModal**: Replace `bg-white/5` and `border-white/10` with `bg-surface-highlight` and `border-subtle`/`border-muted`. Settings should respect the active theme, not force a dark glassy aesthetic.
- **ThemeLab**: As a dedicated floating dev-tool, ThemeLab will retain its fixed dark aesthetic (`bg-[#0a1a19]/50`), but we will clean up inconsistent text opacities (`text-white/60` → semantic local classes if needed).
- **Inputs & Toggles**: Replace `bg-black/20` and `hover:bg-white/10` with `bg-surface-sunken` and `hover:bg-surface-hover`.

### Phase 4: Clean Up & Verification
- **Update Theme Definitions**: Update `cyprus.ts` and `overheatedRhizomeLight.ts` with the new tokens.
- **Remove Orphaned Math**: Clean out HSL lightness shifting from `derivationRules.ts`.
- **Validate**: Run tests (`npm run test`) and visually verify contrast on both a dark and light theme to ensure cross-theme consistency.