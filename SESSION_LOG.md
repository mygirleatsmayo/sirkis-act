# Session Log

## Session 3: UI Polish & Responsiveness
**Date:** 2026-02-15

### What Was Done
- **UI Enhancements**: Improved layout responsiveness and styling across the application.
- **Feature Addition**: Added a "Sirkism" quote carousel to the UI.
- **Refactoring**: Enhanced scroll handling and viewport management.
- **Theme & Branding**: Shifted to a purple-and-gold palette, updated tab title, and added crown favicon (Unreleased).
- **Withdrawals Feature**: Added life expectancy input and growth-aware withdrawal estimates (Unreleased).
- **Salary Inputs**: Added major-based starting salary presets (NACE) and tightened input validation (Unreleased).

### Files Changed
| File | Action |
|------|--------|
| `src/App.tsx` | Modified (UI, Logic, Salary Presets) |
| `src/index.css` | Modified (Styling) |
| `src/components/` | Modified (Various components) |

---

## Session 2: Infrastructure, Branding & Types
**Date:** 2026-02-14

### What Was Done
- **CI/CD**: Configured GitHub Actions for deploying to GitHub Pages (`.github/workflows/deploy.yml`).
- **Type Safety**: Refactored `App.tsx` and components to use proper TypeScript types (`BooleanInputKey` etc.).
- **Feature Addition**: Added Roth IRA match toggle and updated input limits.
- **High-Wire Redesign (0.4.0)**: Visual overhaul with glassmorphic UI, desktop-first sidebar, and editorial typography.
- **Logic Overhaul (0.5.0)**: Dual projections for "start now" vs delayed start, waiting-period visual dimming.
- **Branding**: Updated `index.html` title, added `crown.svg` icon, and updated README.

### Files Changed
| File | Action |
|------|--------|
| `.github/workflows/deploy.yml` | Created |
| `src/App.tsx` | Modified (Types & Features) |
| `CHANGELOG.md` | Created |
| `.gitignore` | Modified |

---

## Session 1: Initial Setup & Core Features
**Date:** 2026-02-13

### What Was Done
- **Project Init (0.1.0)**: Initial commit and project structure setup.
- **Granularity Update (0.2.0)**: Added breakdowns for contributions vs match vs returns.
- **Delayed Start (0.3.0)**: Added "Start investing at" input and loss alert module.
- **Branding**: Created `CrownLogo` component and refined trademark notices in Settings.
- **UI Components**: Built out core chart rendering, potential loss display, and legends.
- **Code cleanup**: Formatted files and removed extra whitespace.

### Files Changed
| File | Action |
|------|--------|
| `src/App.tsx` | Created/Modified |
| `src/CrownLogo.tsx` | Created |
| `src/index.css` | Created |
