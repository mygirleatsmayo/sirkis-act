# Theme Lab Flow Fragility Assessment

Date: 2026-03-03
Scope: Current Theme Lab runtime/edit/export flow
Author: GPT-5.3 Codex Medium in Codex.app

## Summary

Theme Lab works for live editing and export, but several links in the chain are fragile as theming scales beyond Cyprus/playground.

## Fragile Links

1. `themeId -> playground` coupling
- Theme Lab forces `setThemeId('playground')` on open.
- This mixes editor behavior with theme selection behavior and can cause confusing interactions as theme switching grows.

2. Runtime override persistence is implicit and session-only
- `setThemeOverride(theme)` keeps edits visible after close, but only in memory.
- A page reload drops unsaved edits, which can surprise users.

3. Export path drops custom SVG logo
- Export source replaces `branding.logo` with `CrownLogo`.
- Uploaded custom SVG logos are not preserved in exported theme code.

4. Reset baseline logic is stateful
- Reset now correctly uses the theme active at lab-open, but depends on open-cycle refs/state.
- Future lifecycle refactors could regress this behavior if not guarded.

5. No explicit split between draft vs applied theme
- Current flow effectively treats edited theme and previewed theme as one path.
- Makes future UX (Apply/Discard/Revert) harder.

6. Editor-only UI state is non-persistent
- Locks, sticky highlights, and flash state are local/session-scoped.
- Fine for now, but can feel inconsistent if users expect continuity.

7. Manual theme registry step
- Exported themes still require manual placement in `src/themes/` and registry update in `src/themes/index.ts`.
- This remains a workflow break and potential user error point.

## Known Non-Issues (Intentional)

- Brand/text contrast is user-controlled in this theming system; no hardcoded contrast guardrails.
- `Start Now Difference` overlay uses `Immediate Total Nominal` as the top comparison curve by design; tooltip computes numeric gap.

