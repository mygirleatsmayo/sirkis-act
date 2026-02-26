# Settings Modal Design

**Goal:** Add a Settings modal accessible via a gear icon in the header. Houses Theme Studio (Beta) launch point, changelog, and stubs for future features (tour replay, PWA updates). Enables merging `features-theme-architecture` with a proper Theme Lab entry point.

**Scope:** Settings modal only. No onboarding flow, no theme picker, no currency selector, no PWA work.

---

## Trigger: Gear Icon

- Lucide `Settings` icon in the top-right of the header (desktop and mobile)
- Visible in both expanded and collapsed header states on mobile
- Click opens the Settings modal
- No tooltip; gear is universally recognized
- The previous `Ctrl+Shift+T` keyboard shortcut for Theme Lab is removed

---

## Modal Shell

- **Desktop:** centered overlay, `max-w-lg`, semi-transparent backdrop using `bgOverlay` token (`rgba(15, 23, 42, 0.4)`)
- **Mobile:** full-screen panel
- **Header:** "Settings" title + X close button
- **Animation:** CSS-only fade-in + scale
- **Scroll:** modal body scrolls if content exceeds viewport height
- **Focus trap:** focus stays inside modal while open; Escape key closes
- **z-index:** above app content; Theme Lab renders above everything (Settings closes before Theme Lab opens)
- **Dismiss:** X button, Escape key, or backdrop click (desktop only)

---

## Modal Content (top to bottom)

### 1. Theme Studio (Beta)

- Section header: "Theme Studio" with small pill-shaped `Beta` badge (brand-colored)
- Description: "Customize colors, fonts, and branding with a live preview."
- **"Open Theme Studio" button** — brand-colored, prominent. Closes Settings modal, then opens Theme Lab over the live app.
- **"Show floating button" toggle** — off by default. When enabled, displays a FAB on the main app for quick Theme Lab access during iterative editing. Session-only state (resets on page refresh, not persisted to localStorage). Helper text: "Quick access while editing."

### 2. Changelog

- Section header: "Changelog"
- Current version displayed at top (e.g., "v1.1.0")
- Cap to the 3 most recent entries
- Show the latest entry by default; keep the two older entries folded behind an expand/collapse control
- Content sourced from a constant or inline JSX (no external fetch)

### 3. Welcome Tour (stub)

- Section header: "Welcome Tour"
- "Replay Tour" button — disabled, with subtle "(Coming soon)" text
- Will become functional when onboarding modal is implemented

### 4. PWA Updates

- Not rendered in the DOM at all until PWA work is implemented

---

## Theme Lab Integration

- Theme Lab is reachable only via Settings modal ("Open Theme Studio" button) or the opt-in FAB
- The `Ctrl+Shift+T` keyboard shortcut is removed
- The FAB is hidden by default; toggled on/off via the Settings modal toggle
- FAB toggle state is session-only (not persisted)
- "Open Theme Studio" closes Settings first so the user sees Theme Lab over the live app (no stacked modals)
- Theme Lab's close button returns to the app (does not reopen Settings)

---

## File Changes

| File | Action |
|------|--------|
| `src/SettingsModal.tsx` | Create — modal shell + all sections |
| `src/App.tsx` | Modify — add gear icon to header, manage `settingsOpen` state |
| `src/Root.tsx` | Modify — remove keyboard shortcut listener, gate FAB behind toggle state, pass state to SettingsModal |
| `src/ThemeLab.tsx` | Modify — remove any self-contained toggle logic |

No new dependencies. Reuses Lucide icons (`Settings`, `X`), existing theme tokens, existing `useTheme` hook.

---

## Future Slots (not in scope)

These will be added to the Settings modal in future work:

- **Theme picker** — dropdown/grid of available themes (after CCP/Catppuccin themes exist). Will be inserted above Theme Studio, demoting it slightly.
- **Currency selector** — symbol-only mode first, live conversion later. Separate design pass.
- **Onboarding replay** — enables the "Replay Tour" button once onboarding modal is built.
- **PWA update button** — rendered once PWA work is implemented.

---

## State Summary

| State | Scope | Persistence |
|-------|-------|-------------|
| `settingsOpen` | Root/App | React state (session) |
| `showThemeLab` | Root | React state (session) |
| `showFab` | Root | React state (session) |
| `sirkis-theme` | ThemeProvider | localStorage |
