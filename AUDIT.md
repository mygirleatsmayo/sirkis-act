# Codebase Audit Report — Sirkis Act

**Date:** 2026-02-22
**Auditor:** Automated Code Review (Warp Agent)
**Scope:** All files under `src/` — `App.tsx` (1,373 lines), `main.tsx` (10 lines), `index.css` (41 lines), `vite-env.d.ts` (1 line)
**Stack:** React 19 · TypeScript 5.7 (strict) · Vite 6 · Tailwind CSS 3.4 · Recharts 3.7

---

## 1. Architecture & Refactoring Assessment

### Current state

Nearly all application logic lives in `src/App.tsx` at **1,373 lines**. The file contains:

- Module-level constants & utility functions (lines 26–93)
- Seven helper/presentational components (lines 94–300, 517–538)
- `SettingsPanel` — a ~195-line compound form component (lines 314–516)
- The `App` root component — **~833 lines** (lines 540–1372) including state, effects, financial calculations, derived values, input handling, and ~500 lines of JSX

The remaining source files are trivial: `main.tsx` (10 lines, render entrypoint), `index.css` (41 lines, font-face + Tailwind directives), and `vite-env.d.ts` (1 line, Vite type reference).

### Is the single-file approach sustainable?

**No.** The file is well past the threshold where a single file is reasonable for a React application. At ~1,400 lines the file is hard to navigate, hard to review in pull requests, and mixes at least four distinct concerns (constants/types, financial logic, UI components, application state). The practical threshold for a single React component file is roughly 300–500 lines; this file is 3–4× beyond that.

### Proposed component/module breakdown

| Proposed File | What Moves | Reason |
|---|---|---|
| `src/constants.ts` | `DEFAULT_INPUTS`, `LIMITS`, `THEME`, `SIRKISMS` | Pure data; no React dependency. Single source of truth for magic values. |
| `src/types.ts` | `Inputs`, `NumericInputKey`, `BooleanInputKey`, `InputBounds`, `InputValue`, `BadgeColor`, all prop types | Shared across multiple modules. |
| `src/utils/format.ts` | `formatCurrency`, `formatCompact`, `getLossFractionLabel`, `clampNumber` | Pure functions; easily unit-tested in isolation. |
| `src/utils/projection.ts` | `runProjection` (lines 605–674), derived calculation logic (lines 688–741) | Core business logic; must be independently testable. |
| `src/components/ui/GlassCard.tsx` | `GlassCard`, `Card` | Reusable presentational shells. |
| `src/components/ui/Badge.tsx` | `Badge` | Reusable UI atom. |
| `src/components/ui/InputField.tsx` | `InputField` | Complex controlled input — 72 lines with its own state. |
| `src/components/ui/ToggleSection.tsx` | `ToggleSection` | Reusable collapsible toggle. |
| `src/components/ui/TooltipIcon.tsx` | `TooltipIcon` | Self-contained touch/hover tooltip — 57 lines with two effects. |
| `src/components/CrownLogo.tsx` | `CrownLogo` | Large SVG; clutters the main file. |
| `src/components/SettingsPanel.tsx` | `SettingsPanel` (lines 314–516) | Already a standalone component; just needs its own file. |
| `src/components/ProjectionChart.tsx` | AreaChart rendering + legend (lines 1052–1107, 1040–1047) | Isolates Recharts dependency. |
| `src/components/ProjectionTable.tsx` | Table rendering (lines 1109–1173) | Complex table with conditional row collapsing. |
| `src/components/MetricsGrid.tsx` | Target/Growth/Real-Value cards + loss banner (lines 869–1010) | Reduces JSX nesting depth in App. |
| `src/components/WithdrawalsCard.tsx` | Withdrawal section (lines 1215–1246) | Self-contained output display. |
| `src/components/QuickStats.tsx` | Stats footer IIFE (lines 1181–1214) | Removes IIFE pattern from App render. |
| `src/components/MobileDrawer.tsx` | Mobile peek bar + Drawer (lines 1254–1316) | Platform-specific UI; isolates `vaul` dependency. |
| `src/hooks/useViewport.ts` | `isNarrowScreen`, `isMediumScreen`, `isScrolled` logic (lines 557–573) | Reusable viewport hook. |
| `src/hooks/useChartSize.ts` | ResizeObserver chart-sizing logic (lines 578–598) | Encapsulates the manual resize approach. |

### Separation-of-concerns violations

- **Severity: HIGH** — Financial projection logic (`runProjection`, withdrawal calculations) is embedded directly in the render component rather than in a pure module.
- **Severity: HIGH** — Types like `NumericInputKey`, `InputBounds`, `InputValue` are defined inside the `App` function body (lines 743–775). These are effectively runtime dead weight (types are erased) but signal that module-boundary thinking is absent.
- **Severity: MEDIUM** — `INPUT_BOUNDS` is a constant object defined inside the `App` function body (lines 760–774). It gets recreated every render despite containing only static data.
- **Severity: MEDIUM** — CSS-in-JS via a raw `<style>` tag in JSX (lines 1318–1368) mixes stylesheet concerns into the component tree.

### Structural health rating: **4 / 10**

**Justification:** The code works and is internally consistent. Constants are well-organized at the top, and helper components are correctly defined at module scope (not inside `App`). However, the monolithic file, business-logic coupling, and deep JSX nesting make this codebase fragile to extend. A second developer would struggle to contribute without merge conflicts.

---

## 2. Code Smells

### 2.1 Duplicated / copy-paste logic

#### MEDIUM — Triplicated metric card pattern
**File:** `src/App.tsx`, lines 871–992
```tsx
{/* TARGET CARD — lines 871–918 */}
<Card className={`...`}>
  {isDelayed ? (
    <div className="text-center">
      <div className="text-[clamp(...)] ...">{formatCurrency(finalData['Total Nominal'])}</div>
      {useThreeColumnPanels ? ( /* 3-col variant */ ) : ( /* 2-col variant */ )}
    </div>
  ) : (
    <div className="text-center">
      <div className="text-[clamp(...)] ...">{formatCurrency(finalData['Total Nominal'])}</div>
    </div>
  )}
</Card>
{/* GROWTH CARD — lines 920–955 — same structure, different data key */}
{/* REAL VALUE CARD — lines 957–992 — same structure, different data key */}
```
**Why it matters:** The Target, Growth, and Real Value cards share identical conditional rendering logic (`isDelayed ? (useThreeColumnPanels ? ... : ...) : ...`) with only the data key and badge text changing. This is ~120 lines that could be a single `<MetricCard>` component driven by props.

#### MEDIUM — Loss message rendered twice
**File:** `src/App.tsx`, lines 900–906 and 1001–1007
```tsx
{/* First occurrence (2-col layout): */}
<p className="font-display italic ..." style={{ ... }}>
  {missedContributions > 0
    ? `The cost of waiting ${delayYears} ${lossYearLabel} isn't ${formatCurrency(missedContributions)}…`
    : `The cost of waiting ${delayYears} ${lossYearLabel}…`
  }<br />it's {getLossFractionLabel(lossFraction)} ...
</p>

{/* Second occurrence (3-col layout) — identical logic: */}
<p className="font-display italic ..." style={{ ... }}>
  {missedContributions > 0 ? ... : ...}<br />it's {getLossFractionLabel(lossFraction)} ...
</p>
```
**Why it matters:** Any copy in this message must be updated in two places, or they'll drift.

#### LOW — Duplicated toggle switch markup
**File:** `src/App.tsx`, lines 290–292 (ToggleSection) and 492–494 (Roth match toggle)
```tsx
<div className={`w-12 h-7 flex items-center rounded-full p-1 ...`}>
  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform ... ${enabled ? 'translate-x-5' : ''}`} />
</div>
```
**Why it matters:** The visual toggle is duplicated. A `<Switch>` primitive would eliminate this.

### 2.2 Magic numbers / hardcoded values

#### MEDIUM — Breakpoint values scattered inline
**File:** `src/App.tsx`, lines 559–560
```tsx
setIsNarrowScreen(window.innerWidth < 640);
setIsMediumScreen(window.innerWidth >= 640 && window.innerWidth < 1024);
```
Also at line 1349: `@media (max-width: 1023px)`. Tailwind's default `sm` and `lg` breakpoints (640, 1024) are used via raw numbers.
**Why it matters:** Breakpoints should be shared constants to stay in sync with Tailwind config.

#### MEDIUM — Scroll threshold magic number
**File:** `src/App.tsx`, line 569
```tsx
setIsScrolled(scrollY > 60);
```
**Why it matters:** The value `60` has no explanation; it should be a named constant like `SCROLL_COMPACT_THRESHOLD`.

#### LOW — Tolerance constant `0.008` in label logic
**File:** `src/App.tsx`, line 66
```tsx
const tol = 0.008;
```
**Why it matters:** Local constant is fine but the magic value could use a comment explaining why 0.8% was chosen.

#### LOW — Chart container threshold `550`
**File:** `src/App.tsx`, line 711
```tsx
const useThreeColumnPanels = chartSize.width >= 550;
```
Also `750` at line 1188. These layout breakpoints are undocumented.

### 2.3 Functions over 50 lines

#### HIGH — `App` component: 833 lines (lines 540–1372)
**Why it matters:** Impossible to reason about at a glance. Contains state, effects, calculations, input handling, and rendering.

#### HIGH — `SettingsPanel` component: 195 lines (lines 322–516)
**Why it matters:** Large but internally coherent. Splitting into subsections would improve readability.

#### MEDIUM — `runProjection`: 70 lines (lines 605–674)
**Why it matters:** Financial projection logic that would benefit from unit tests; hard to test when buried in a `useMemo`.

#### MEDIUM — `InputField`: 72 lines (lines 209–281)
**Why it matters:** Moderate complexity; has its own state synchronization logic.

#### LOW — `TooltipIcon`: 57 lines (lines 152–208)
**Why it matters:** Just over the threshold; self-contained.

### 2.4 Deeply nested code (>3 levels)

#### MEDIUM — Metric card conditional nesting
**File:** `src/App.tsx`, lines 871–918
```
Card → isDelayed ternary → useThreeColumnPanels ternary → inner JSX → formatCurrency
```
Four levels of conditional nesting in the Target card alone. The Growth and Real Value cards repeat this pattern.

#### MEDIUM — Table row rendering with conditional collapse
**File:** `src/App.tsx`, lines 1129–1170
```
flatMap → isWaiting conditional → waitingCount conditional → return array → JSX row
```
The `flatMap` with multiple early returns and conditionals is hard to follow.

### 2.5 Inconsistent patterns

#### MEDIUM — Mixed color sourcing: THEME constant vs. hardcoded hex
**File:** `src/App.tsx`, throughout

Some colors reference `THEME`:
```tsx
style={{ color: THEME.brand }}    // line 289
style={{ color: THEME.returns }}  // line 350
```
Other colors use raw hex values that should be in THEME:
```tsx
className="bg-[#004745] ..."      // line 97 — same as THEME.bg area
className="bg-[#004240] ..."      // line 102
className="bg-[#002E2B] ..."      // line 264 — input background, used 4+ times
className="border-[#006560]/50"   // line 264 — input border, used 4+ times
```
**Why it matters:** Color changes require a search-and-replace instead of a single constant update. The colors `#004240`, `#002E2B`, `#006560` each appear multiple times but are not in `THEME`.

#### LOW — Inconsistent string literal quoting for object keys
**File:** `src/App.tsx`, lines 656–669

Data object keys use quoted strings (`'Your Contributions'`, `'Total Real (Today\'s $)'`), which is necessary for keys with spaces, but mixing quoted and unquoted property access throughout makes the code harder to scan.

### 2.6 Unused code / dead code paths

#### MEDIUM — `Total Real (Retirement $)` is computed but never displayed
**File:** `src/App.tsx`, line 668
```tsx
'Total Real (Retirement $)': Math.round(totalRealAtRetirement),
```
This value is calculated at line 655 and stored in the data array, but is never referenced in the chart, table, or any other UI element.
**Why it matters:** Wasted computation on every projection tick (2× per `useMemo` invocation) and conceptual noise.

#### LOW — `salary` field computed but not displayed
**File:** `src/App.tsx`, line 669
```tsx
salary: Math.round(currentSalary)
```
Computed for each year of the projection but never rendered.
**Why it matters:** Minor wasted work; may have been intended for a future table column.

---

## 3. Bugs & Fragile Code

### 3.1 Missing error handling

#### MEDIUM — Non-null assertion on root element
**File:** `src/main.tsx`, line 6
```tsx
ReactDOM.createRoot(document.getElementById("root")!).render(
```
**Why it matters:** If `#root` is missing from `index.html`, this throws an unrecoverable runtime error with no useful message. A guard with a descriptive error would improve debuggability.

#### MEDIUM — No React Error Boundary
**File:** `src/main.tsx` / `src/App.tsx`
**Why it matters:** Any runtime error in the render tree (e.g., accessing a property on `undefined`) will white-screen the entire app. An error boundary would catch and display a fallback UI.

#### LOW — `parseFloat` without NaN guard on number inputs
**File:** `src/App.tsx`, lines 453, 457
```tsx
onChange={(e) => handleInputChange('matchPercent', parseFloat(e.target.value))}
onChange={(e) => handleInputChange('matchLimit', parseFloat(e.target.value))}
```
**Why it matters:** If the user clears the field, `parseFloat("")` returns `NaN`. The downstream `clampNumber` function does handle NaN by returning the fallback value, so this is *not a crash bug*, but the intent is implicit and fragile — it only works because of a safety net several function calls away.

### 3.2 State synchronization issues

#### MEDIUM — `draftValue` can be overwritten mid-edit
**File:** `src/App.tsx`, lines 210–213
```tsx
const [draftValue, setDraftValue] = useState(Number.isFinite(value) ? String(value) : "");
useEffect(() => {
  setDraftValue(Number.isFinite(value) ? String(value) : "");
}, [value]);
```
**Why it matters:** If a parent re-render passes the same `value` prop while the user is mid-keystroke in the text input, React's state batching *usually* prevents a visible glitch, but on slow devices or with concurrent features, the effect could overwrite the user's in-progress draft. The standard fix is to track whether the text input is focused and skip syncing.

#### LOW — `showImmediateLine` is only auto-hidden, never auto-shown
**File:** `src/App.tsx`, lines 552–556
```tsx
useEffect(() => {
  if (inputs.startAge > inputs.currentAge) {
    setShowImmediateLine(false);
  }
}, [inputs.startAge, inputs.currentAge]);
```
**Why it matters:** When the user increases `startAge` above `currentAge`, the "Start Now" comparison line is hidden. If the user then resets `startAge` back to `currentAge` and later increases it again, the line is hidden again. This is arguably correct behavior, but the asymmetry (auto-hide but no auto-show) could confuse users who toggled it on and then adjusted ages.

### 3.3 useEffect concerns

#### LOW — `activeTab` dependency on chart ResizeObserver
**File:** `src/App.tsx`, line 598
```tsx
}, [activeTab]);
```
**Why it matters:** Changing between "Chart" and "Table" tabs tears down and rebuilds the entire `ResizeObserver` + `orientationchange` listener setup. This is functionally correct but wasteful. The observer could remain mounted and simply check visibility.

### 3.4 Edge cases in financial calculations

#### MEDIUM — No validation that `finalData` / `comparisonData` are defined before property access in JSX
**File:** `src/App.tsx`, lines 878, 885, 893, etc.
```tsx
{formatCurrency(finalData['Total Nominal'])}
{formatCurrency(comparisonData['Total Nominal'])}
```
**Why it matters:** `finalData` is `mainResults[mainResults.length - 1]` which is `undefined` when the array is empty. The current input validation prevents this (retirement age is always > current age, guaranteeing at least one loop iteration), but the code relies on an implicit invariant. If validation logic is ever relaxed, these will crash. TypeScript does not flag this because array index access returns `T`, not `T | undefined`, without `noUncheckedIndexedAccess`.

#### LOW — Withdrawal calculation when return equals inflation
**File:** `src/App.tsx`, lines 696, 701–703
```tsx
const realMonthlyReturn = Math.pow((1 + annualReturn) / (1 + annualInflation), 1 / 12) - 1;
const monthlyRealWithdrawal = realMonthlyReturn > 0
  ? (retirementBalanceToday * realMonthlyReturn) / (1 - Math.pow(1 + realMonthlyReturn, -monthsInRetirement))
  : retirementBalanceToday / monthsInRetirement;
```
**Why it matters:** When `expectedReturn < inflationRate`, `realMonthlyReturn` is negative. The code only checks `> 0`, so it falls through to the simple division, which gives an incorrect annuity result for negative real returns. The PMT formula works for negative rates but the current fallback ignores the time-value-of-money in that scenario.

### 3.5 Conditions of note

#### LOW — `getLossFractionLabel` unreachable fallback
**File:** `src/App.tsx`, line 92
```tsx
return 'a portion of';
```
**Why it matters:** The final `return` at line 92 can only be reached if `f > 0.75 + tol` and `f < 0.81` (a very narrow band). The function handles `f >= 0.90 - tol` and `f > 0.81` at lines 67–68, and the loop's last level is 0.75 at line 78 which returns `over three quarters of`. So the band `(0.758, 0.81)` returns the generic `'a portion of'` — which is less descriptive than what the surrounding bands produce. This is more of a logic gap than a bug.

---

## 4. TypeScript Quality

### 4.1 Use of `any` or type suppression

No explicit `any` types found. No `@ts-ignore` or `@ts-expect-error` directives. The `as const` assertion on `THEME` is correct.

### 4.2 Types that could be narrower

#### MEDIUM — `contributionTiming` inferred as `string`
**File:** `src/App.tsx`, line 44
```tsx
contributionTiming: 'start',
```
Since `Inputs` is `typeof DEFAULT_INPUTS` (line 315), `contributionTiming` is typed as `string` rather than `'start' | 'mid'`. An invalid value like `'end'` would be accepted silently.
**Why it matters:** A union type `'start' | 'mid'` would catch invalid values at compile time and enable exhaustive switch checks.

#### MEDIUM — `InputValue` type is too broad
**File:** `src/App.tsx`, line 775
```tsx
type InputValue = Inputs[InputKey] | number | string | boolean;
```
**Why it matters:** This collapses to essentially `number | string | boolean`, erasing any per-key type safety. `handleInputChange('currentAge', 'banana')` would type-check.

#### LOW — `handleInputChange` key/value pairing not enforced
**File:** `src/App.tsx`, line 776
```tsx
const handleInputChange = (key: InputKey | 'RESET', value: InputValue) => {
```
**Why it matters:** A discriminated overload signature or a generic approach (`<K extends InputKey>(key: K, value: Inputs[K])`) would tie the value type to the key.

#### LOW — `runProjection` return type not annotated
**File:** `src/App.tsx`, line 605
```tsx
const runProjection = (startAgeOverride: number) => {
```
**Why it matters:** The return type is an array of anonymous object types with ~15 properties. An explicit `ProjectionRow` interface would document the shape and enable autocomplete for consumers.

### 4.3 Missing type annotations on complex return values

#### LOW — `useMemo` result destructured without explicit type
**File:** `src/App.tsx`, line 603
```tsx
const { results, chartData, comparisonData, finalData } = useMemo(() => {
```
**Why it matters:** `comparisonData` and `finalData` can theoretically be `undefined` (empty arrays), but TypeScript infers them as the element type without `| undefined`, masking potential null dereferences.

---

## 5. Performance

### 5.1 Expensive computations

#### LOW — Full dual-projection recalculation on any input change
**File:** `src/App.tsx`, line 687
```tsx
}, [inputs]);
```
**Why it matters:** The `useMemo` depends on the entire `inputs` object. Changing a purely cosmetic field (if one existed) or toggling a checkbox triggers two full projection loops. With current input count (~15 fields) and projection length (~44 years default), this is cheap (~2× 44 iterations), so it's not a real problem today. It would matter if projections grew more complex.

### 5.2 Inline objects/arrays recreated every render

#### MEDIUM — `INPUT_BOUNDS` recreated inside App body every render
**File:** `src/App.tsx`, lines 760–774
```tsx
const INPUT_BOUNDS: InputBounds = {
  currentAge: { min: 18, max: 80 },
  startAge: { min: 18, max: 100 },
  // ... 11 more entries
};
```
**Why it matters:** This is a static lookup table that references only module-level constants (`LIMITS.rothAnnual`, `LIMITS.hsaFamily`). It should be a module-level constant. Recreating it on every render allocates ~13 objects per frame.

#### MEDIUM — Recharts `Tooltip` style objects inline
**File:** `src/App.tsx`, lines 1088, 1094
```tsx
contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', ... }}
labelStyle={{ color: 'rgba(255,255,255,0.9)', ... }}
```
**Why it matters:** Recharts does shallow-compare on these props. New object references on every render force Recharts to re-apply styles even when nothing changed.

#### LOW — `legendItems` array recreated every render
**File:** `src/App.tsx`, lines 712–717
```tsx
const legendItems = [
  { label: 'Your Contributions', color: THEME.brand, visible: true },
  // ...
];
```
**Why it matters:** Small allocation but could be memoized trivially since it only depends on `isDelayed` and `showImmediateLine`.

### 5.3 Components / closures defined inside the App function body

#### MEDIUM — IIFE pattern for Quick Stats rendering
**File:** `src/App.tsx`, lines 1181–1214
```tsx
{(() => {
  const stats = [ ... ];
  return (
    <div className={`grid ...`}>
      {stats.map((stat, i) => { ... })}
    </div>
  );
})()}
```
**Why it matters:** The IIFE creates a new closure on every render. Extracting this to a `<QuickStats>` component would allow React to skip re-rendering when props are unchanged.

#### LOW — Inline `<style>` tag in JSX
**File:** `src/App.tsx`, lines 1318–1368
```tsx
<style>{`
  .recharts-surface { overflow: visible; }
  .custom-scrollbar::-webkit-scrollbar { ... }
  ...
`}</style>
```
**Why it matters:** The browser parses and re-injects ~50 lines of CSS on every render. These styles are static and should live in `index.css`.

---

## 6. Accessibility

### 6.1 Missing ARIA attributes

#### HIGH — Toggle switches lack `role`, `aria-checked`, and keyboard handling
**File:** `src/App.tsx`, lines 284–299 (`ToggleSection`)
```tsx
<div
  className={`flex items-center justify-between p-4 cursor-pointer ...`}
  onClick={() => onToggle(!enabled)}
>
  <span ...>{label}</span>
  <div className={`w-12 h-7 flex items-center rounded-full ...`}>
    <div className={`bg-white w-5 h-5 rounded-full ...`} />
  </div>
</div>
```
**Also:** Roth match toggle at lines 489–495.
**Why it matters:** Screen readers cannot identify these as toggles. They are not focusable via Tab. Missing `role="switch"`, `aria-checked={enabled}`, `tabIndex={0}`, and `onKeyDown` for Enter/Space.

#### HIGH — Chart/Table tab switcher lacks tab-list semantics
**File:** `src/App.tsx`, lines 1024–1037
```tsx
<div className="bg-black/25 p-1 rounded-xl flex text-xs font-bold shadow-inner">
  <button onClick={() => setActiveTab('chart')} className={`...`}>Chart</button>
  <button onClick={() => setActiveTab('table')} className={`...`}>Table</button>
</div>
```
**Why it matters:** Missing `role="tablist"` on the container, `role="tab"` and `aria-selected` on each button, and `role="tabpanel"` on the content area. Screen readers see two generic buttons with no relationship to the switched content.

#### MEDIUM — `<select>` for salary-by-major has no associated label
**File:** `src/App.tsx`, lines 389–414
```tsx
<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Starting Salary by Major</label>
...
<select value="" onChange={...} className="...">
```
**Why it matters:** The `<label>` has no `htmlFor` attribute and the `<select>` has no `id`, so they are not programmatically associated. Screen readers won't announce the label when the select is focused.

#### MEDIUM — Match %/Limit % number inputs lack label association
**File:** `src/App.tsx`, lines 451–458
```tsx
<label className="...">Match % ...</label>
<input type="number" ... />
<label className="...">Limit % ...</label>
<input type="number" ... />
```
**Why it matters:** Same issue — no `htmlFor`/`id` pairing.

#### MEDIUM — Data table lacks accessible name
**File:** `src/App.tsx`, lines 1110–1111
```tsx
<table className="w-full text-left text-[11px] sm:text-sm">
  <thead ...>
```
**Why it matters:** The table has no `<caption>` or `aria-label`. Screen readers will announce "table" with no context about what data it contains.

#### LOW — Mobile peek bar missing `aria-label`
**File:** `src/App.tsx`, lines 1256–1261
```tsx
<div
  className="fixed inset-x-0 bottom-0 z-40 cursor-pointer select-none touch-none"
  onClick={() => setIsSettingsOpen(true)}
  role="button"
  tabIndex={0}
>
```
**Why it matters:** `role="button"` is present (good), but there is no `aria-label` describing what the button does (e.g., "Open settings").

#### LOW — Contribution Timing buttons lack `aria-pressed`
**File:** `src/App.tsx`, lines 422–430
```tsx
<button
  onClick={() => handleInputChange('contributionTiming', option)}
  className={`... ${inputs.contributionTiming === option ? 'text-white shadow-sm' : '...'}`}
>
```
**Why it matters:** The selected state is only conveyed visually. Adding `aria-pressed={inputs.contributionTiming === option}` communicates state to assistive technology.

### 6.2 Keyboard navigation gaps

#### HIGH — ToggleSection `onClick` on a `<div>` without keyboard support
**File:** `src/App.tsx`, lines 285–287
**Why it matters:** The entire toggle header is clickable but has no `tabIndex`, no `role`, and no `onKeyDown` handler. Keyboard-only users cannot toggle 401(k), Roth IRA, or HSA sections.

### 6.3 Color contrast concerns

#### MEDIUM — `text-slate-400` on `#003D3A` / `#004745` backgrounds
**File:** `src/App.tsx`, throughout (e.g., lines 222, 246, 270, 275, 389)
**Why it matters:** `slate-400` is `#94a3b8`. Against `#003D3A` the contrast ratio is approximately 4.3:1, which passes WCAG AA for normal text (≥4.5:1 at 16px+) but fails for the `text-[10px]` and `text-[11px]` small-text instances that require 4.5:1 AA or 7:1 AAA. Many labels and helpers use 10–11px text at this color.

#### LOW — `THEME.startNow` (#0D9488) visually close to `THEME.brand` (#00A499)
**File:** `src/App.tsx`, lines 58–59
**Why it matters:** On the chart, the "Start Now" line and the "Your Contributions" area use colors that are perceptually similar (both teal-green). Users with color vision deficiencies may not distinguish them, especially since one is a dashed line and the other is a filled area. The dashed line pattern helps, but an alternative color or pattern would improve accessibility.

---

## Summary

### Counts by severity and category

| Category | CRITICAL | HIGH | MEDIUM | LOW | Total |
|---|---|---|---|---|---|
| 1. Architecture & Refactoring | 0 | 2 | 2 | 0 | 4 |
| 2. Code Smells | 0 | 2 | 6 | 4 | 12 |
| 3. Bugs & Fragile Code | 0 | 0 | 4 | 4 | 8 |
| 4. TypeScript Quality | 0 | 0 | 2 | 3 | 5 |
| 5. Performance | 0 | 0 | 3 | 2 | 5 |
| 6. Accessibility | 0 | 3 | 4 | 2 | 9 |
| **Total** | **0** | **7** | **21** | **15** | **43** |

### Top 5 recommendations by impact

1. **Add keyboard support and ARIA roles to toggle switches** (Accessibility — HIGH). Three account sections (401k, Roth, HSA) and the Roth match toggle are completely inaccessible to keyboard and screen-reader users. This is the most impactful single fix for inclusivity.

2. **Split `App.tsx` into modules** (Architecture — HIGH). Extract financial calculations into a pure utility, move constants/types to shared modules, and break the rendering into focused components. This is the highest-leverage structural change for maintainability, testability, and team scalability.

3. **Extract the metric card pattern into a reusable component** (Code Smells — MEDIUM). The triplicated Target/Growth/Real-Value card code and the duplicated loss message account for ~150 lines of near-identical JSX. A single `<MetricCard>` component would cut this by ~60% and ensure copy consistency.

4. **Add tab-list semantics to Chart/Table switcher** (Accessibility — HIGH). The tab interface is a core navigation pattern and needs `role="tablist"`, `role="tab"`, `aria-selected`, and `role="tabpanel"` to be screen-reader compatible.

5. **Hoist `INPUT_BOUNDS` and inline style objects to module scope** (Performance / Code Smells — MEDIUM). Moving static objects out of the render path eliminates unnecessary allocations and makes Recharts `Tooltip` memo-safe. Low effort, measurable improvement in render efficiency.
