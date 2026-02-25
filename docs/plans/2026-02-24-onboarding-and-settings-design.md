# Onboarding Flow & Settings Page — Design

## Summary

Add a welcome tour for first-time visitors, a version-triggered "What's New" display for returning visitors, a settings modal accessible via a gear icon, and localStorage-based persistence for user state.

---

## Onboarding Modal

A single modal component with two mutually exclusive modes:

### Tour Mode

Shown on **first visit** (no `sirkis-onboarded` flag in localStorage) or when **"Replay tour"** is triggered from the settings page.

Seven slides with prev / next / skip navigation:

1. **Welcome** — branding moment, one-liner about what the app does
2. **Your Inputs** — salary, age, retirement age; where to find them (sidebar on desktop, drawer on mobile)
3. **Accounts** — 401(k)/403(b), Roth IRA, HSA toggles; what employer match means
4. **The Comparison** — delayed start vs. start now; the loss banner
5. **Chart & Table** — how to read the projection, toggle between views
6. **Withdrawals** — what the withdrawal section shows and its assumptions
7. **What's New** — curated highlights for the current version, with a "View full changelog" link that closes the onboarding modal and opens the settings modal to the changelog section

Completing or skipping the tour sets `sirkis-onboarded: true` and `sirkis-version` to the current app version.

### Updates Mode

Shown on **return visit when stored version doesn't match current version**. Not shown if version matches.

- Curated "What's New" highlights (2–3 bullet points per notable release, hand-written)
- "View full changelog" link → closes onboarding modal, opens settings modal to changelog section
- Dismissing updates the stored version to current

### Behavior Rules

| Condition | Action |
|-----------|--------|
| No `sirkis-onboarded` flag | Auto-open → Tour mode |
| `sirkis-onboarded` true, version mismatch | Auto-open → Updates mode |
| `sirkis-onboarded` true, version matches | No auto-open |
| "Replay tour" from settings | Open → Tour mode |

The Tour tab is **never visible** in Updates mode. The modal shows one mode at a time based on context.

---

## Navigation

- **Gear icon** in the top-right of the header (both desktop and mobile)
- Opens the settings modal
- Future: a second icon beside the gear for a Resources page
- If icon count grows beyond two, migrate to an overflow menu (⋮)

---

## Settings Modal

- **Desktop**: centered, constrained width (e.g., `max-w-lg`)
- **Mobile**: full-screen
- Dismissable via X button or backdrop click

### Contents

1. **Theme Switcher** — select from available themes (architecture TBD in feature-dev phase)
2. **Replay Welcome Tour** — opens the onboarding modal in Tour mode
3. **Changelog** — full version history, scrollable; includes current version number at top
4. **PWA Update Button** — placeholder for future PWA work; hidden until implemented

---

## State Persistence

localStorage with three keys:

| Key | Type | Purpose |
|-----|------|---------|
| `sirkis-onboarded` | boolean | Whether user has completed or skipped the tour |
| `sirkis-version` | string | Last seen app version (e.g., `"1.0.0"`) |
| `sirkis-theme` | string | Selected theme ID (e.g., `"cyprus"`) |

No backend. No export/import.

---

## Implementation Workflow

1. **Theme architecture** — `/feature-dev` to design the theme system (CSS variables, theme definitions, switching logic)
2. **UI buildout** — `/frontend-design` to build the settings modal, onboarding modal, gear icon, and wire up the theme switcher
3. **Content** — populate tour slide content/illustrations and What's New entries (can happen alongside or after UI work)
