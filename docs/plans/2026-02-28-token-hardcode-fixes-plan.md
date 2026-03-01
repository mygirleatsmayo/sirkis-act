# Theme Token Hardcode Fixes

Replace hardcoded `text-white` with proper theme tokens and fix several other issues across [App.tsx](file:///Users/mygirleatsmayo/Desktop/Dev/sirkis-act/src/App.tsx).

## Proposed Changes

### Batch 1 — `text-white` → `text-content-primary`

All in [App.tsx](file:///Users/mygirleatsmayo/Desktop/Dev/sirkis-act/src/App.tsx):

| Line | Element | Current | New |
|---|---|---|---|
| 92–93 | MetricCard `valueClassName` (both hero and non-hero) | `text-white` | `text-content-primary` |
| 110 | Start Early comparison value (3-col) | `text-white` | `text-content-primary` |
| 251 | Numeric input field | `text-white` | `text-content-primary` |
| 389 | Salary major `<select>` | `text-white` | `text-content-primary` |
| 437 | Match % `<input>` | `text-white` | `text-content-primary` |
| 441 | Match Limit `<input>` | `text-white` | `text-content-primary` |
| 775 | Start Early value (2-col) | `text-white` | `text-content-primary` |
| 833 | "The Trajectory" `<h2>` | `text-white` | `text-content-primary` |
| 1062 | "Withdrawals" `<h3>` | `text-white` | `text-content-primary` |
| 1073 | Fixed Purchasing Power value | `text-white` | `text-content-primary` |
| 1078 | Fixed Monthly value | `text-white` | `text-content-primary` |
| 1083 | Fixed Annual value | `text-white` | `text-content-primary` |

**Table Nominal column** (separate from batch — user wants to revisit table theming later):

| Line | Element | Current | New |
|---|---|---|---|
| 1002 | Waiting-summary Nominal cell | `text-white/90` | `text-content-primary/90` |
| 1019 | Row Nominal cell | `text-white/90` | `text-content-primary/90` |

**Not changing** (intentional or UI-state specific):
- L327, L850, L859: hover states (`hover:text-white`) — these are interactive highlights, acceptable as-is
- L683: skip-to-content link — accessibility element, fine as white
- L410: contribution timing active button — on brand background, white is correct for contrast
- L839: Start-Now button inactive — handled separately in Batch 4

> [!IMPORTANT]
> The MetricCard comparison values on L120–121 (`text-white`) are inside the **2-column delayed layout**. These also need `text-content-primary`. I'll include them.

---

### Batch 2 — Withdrawal panels `bg-surface/60` → `bg-surface-glass`

| Line | Panel | Current | New |
|---|---|---|---|
| 1071 | Fixed Purchasing Power | `bg-surface/60` | `bg-surface-glass` |
| 1076 | Fixed Monthly | `bg-surface/60` | `bg-surface-glass` |
| 1081 | Fixed Annual | `bg-surface/60` | `bg-surface-glass` |

The Start Early sub-cards (L108, L773, L777) are different — they're inside MetricCards, not the Withdrawal section. Leaving those as `bg-surface/60` for now unless you say otherwise.

---

### Batch 3 — startAge delay border: `returns` → `loss`

| Line | Current | New |
|---|---|---|
| 341 | `bg-accent-returns/8 ring-1 ring-accent-returns/25` | `bg-accent-loss/8 ring-1 ring-accent-loss/25` |

This makes semantic sense — a delay is a potential loss indicator, not a returns concept.

---

### Batch 4 — Start-Now button inactive text

| Line | Current | New |
|---|---|---|
| 839 | `text-white` (in the inactive/filled state) | `text-content-primary` |

> [!NOTE]
> This is a quick fix. The user has a separate `[?]` TODO about potentially reworking this button's color logic entirely (consuming bgGlass as text color for state inversion). This change just removes the hardcode for now.

---

## Verification Plan

### Automated
- `npx vitest run` — ensure derivation rule tests still pass (no type/token changes in this batch, but good to confirm)
- `npx tsc --noEmit` — type-check passes

### Manual (user QA)
Since these are all visual changes, they need eyeball verification. Specifically:
1. **Dark mode** — all replaced elements should look identical to current (textPrimary = `#ffffff` in dark mode)
2. **Light mode via Theme Lab** — switch to light bg → all headings, input values, metric numbers, and withdrawal panel numbers should flip to dark text instead of staying white
3. **Withdrawal panels** — should match visual treatment of other GlassCard surfaces
4. **startAge delay border** — set startAge > currentAge, border should be red-tinted instead of gold
5. **Start-Now button** — when inactive (filled), text should respond to textPrimary token changes in Theme Lab
