# Token Restructure & Theme Lab UX Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the theme token system (split Returns into Returns + Brand Accent, remove Muted/onBrand, add OPM BG + Neutral BG), update all consumers, and improve Theme Lab UX.

**Architecture:** The token restructure touches every layer: types (`ThemeColors`), theme definitions (Cyprus, Playground), derivation rules, CSS var sync, Tailwind config, and all consumers in App.tsx/SettingsModal.tsx/ThemeLab.tsx. Each task is scoped to one layer to keep diffs reviewable. Tests are updated alongside each change.

**Tech Stack:** React 19, TypeScript 5.7 (strict), Tailwind CSS 3.4, Vitest, Recharts

**Branch:** `theme-lab-derived` (already checked out; all work stays here)

**Prerequisites:** User has tested flash/mode/reset fixes from the prior session. If bugs remain, fix those first.

---

## Overview of Token Changes

| Current Token | Action | New Token(s) | Rationale |
|---|---|---|---|
| `returns` | **Split** | `returns` (Investment Returns data only) + `brandAccent` (hero line 2, sidebar/vaul section headers, blobs, glows) | Returns was overloaded as both data color and visual accent |
| `textMuted` | **Remove** | Consumers → `textSecondary` (most) or `textNeutral` (Real Value badge) | Redundant with textSecondary |
| `textOnBrand` | **Remove** | Consumers use hardcoded `#ffffff` | On-brand text must stay white in all modes |
| `neutral` | **Remove** | Replaced by `neutralBg` (derived from `textNeutral`) | Now derived, not mode-static |
| *(new)* `textNeutral` | **Add** | Text for neutral/real-value contexts (Cyprus: `#e2e8f0`) | Semantic neutral text color |
| *(new)* `neutralBg` | **Add** | Derived from `textNeutral` at alpha 0.10 | Real Value badge background |
| *(new)* `opmBg` | **Add** | Derived from `opm` at alpha 0.08 | Same pattern as returnsBg, lossBg |
| *(new)* `brandAccent` | **Add** | New primary for hero line 2, section headers, blobs, glows | Decouples accent from data color |

### Token removal details

- **`textMuted` removed:** Everything consuming `textMuted` (Tailwind `content-muted` or `theme.colors.textMuted`) switches to `textSecondary` (`content-secondary`), except Real Value badge text which uses new `textNeutral`.
- **`textOnBrand` removed:** The 2 consumers in SettingsModal use hardcoded `'#ffffff'` (on-brand text must stay white regardless of dark/light mode).
- **`neutral` removed:** Replaced by `neutralBg` which is now *derived* from `textNeutral` rather than being a mode-static value. Real Value badge background uses `neutralBg`.

---

## Task 1: Add `opmBg` and `brandAccent` to ThemeColors + Cyprus + derivation rules

**Files:**
- Modify: `src/themes/types.ts` (ThemeColors interface)
- Modify: `src/themes/cyprus.ts` (add new color values)
- Modify: `src/themes/derivationRules.ts` (Primaries, DerivedColors, applyDerivations)
- Modify: `src/themes/playground.ts` (inherits from cyprus, no structural change needed)
- Modify: `src/__tests__/derivationRules.test.ts`

**Step 1: Update ThemeColors interface**

In `src/themes/types.ts`, add after `opm`:
```typescript
opmBg: string;              // OPM tint background (derived from opm)
```

Add after `returns`:
```typescript
brandAccent: string;        // brand accent / hero line 2 / blobs / glows
brandAccentBg: string;      // brand accent tint background
```

**Step 2: Update Primaries interface in derivationRules.ts**

Add `brandAccent` to the `Primaries` interface:
```typescript
export interface Primaries {
  bg: string;
  brand: string;
  brandAccent: string;  // NEW
  returns: string;
  loss: string;
  startNow: string;
  opm: string;
}
```

Update `extractPrimaries` to include `brandAccent`:
```typescript
export const extractPrimaries = (colors: ThemeColors): Primaries => ({
  bg: colors.bg,
  brand: colors.brand,
  brandAccent: colors.brandAccent,
  returns: colors.returns,
  loss: colors.loss,
  startNow: colors.startNow,
  opm: colors.opm,
});
```

**Step 3: Update DerivedColors**

In `DerivedColors`, the `heroLine2Color` should now derive from `brandAccent` instead of `returns`. Glow and blob colors also derive from `brandAccent`.

Update `applyDerivations`:
```typescript
// In the colors object:
brandAccent: p.brandAccent,
brandAccentBg: hexToRgba(p.brandAccent, 0.08),

// opm derivation (NEW)
opmBg: hexToRgba(p.opm, 0.08),

// returns derivation — returnsBg stays
returnsBg: hexToRgba(p.returns, 0.08),
```

Update the return block:
```typescript
return {
  colors,
  heroLine1Color: p.brand,
  heroLine2Color: p.brandAccent,    // was p.returns
  glowColors: [
    hexToRgba(p.brandAccent, 0.50), // was p.returns
    hexToRgba(p.brandAccent, 0.32),
    hexToRgba(p.brandAccent, 0.20),
  ],
  blobColors: [
    hexToRgba(p.brandAccent, 0.10), // was p.returns
    hexToRgba(p.brandAccent, 0.05),
  ],
};
```

**Step 4: Update Cyprus theme**

In `src/themes/cyprus.ts`, add:
```typescript
brandAccent: '#E6C300',       // was the returns color used for hero/blobs/glows
brandAccentBg: 'rgba(230, 195, 0, 0.08)',
opmBg: 'rgba(157, 224, 147, 0.08)',
```

The `returns` value stays `'#E6C300'` for now (same as brandAccent in Cyprus), since historically they were the same color. The *conceptual* split means future themes can make them different.

**Step 5: Update PRIMARY_KEYS in ThemeLab.tsx**

Add `'brandAccent'` to the `PRIMARY_KEYS` set (line 125).

**Step 6: Update tests**

In `src/__tests__/derivationRules.test.ts`:
- Add `brandAccent: '#E6C300'` to `cyprusPrimaries`
- Add test for `opmBg` derivation
- Add test for `brandAccentBg` derivation
- Update `heroLine2Color` test to assert `cyprusPrimaries.brandAccent` instead of `cyprusPrimaries.returns`
- Update `glowColors` test to use brandAccent alphas
- Update `blobColors` test to use brandAccent alphas

**Step 7: Run tests**

Run: `npm run test`
Expected: All tests pass

**Step 8: Run lint + build**

Run: `npm run lint && npm run build`
Expected: Zero warnings, clean build (note: TypeScript will error until consumers are updated in later tasks; if so, skip build for now and verify after Task 3)

**Step 9: Commit**

```bash
git add src/themes/types.ts src/themes/cyprus.ts src/themes/derivationRules.ts src/themes/playground.ts src/__tests__/derivationRules.test.ts
git commit -m "feat: add brandAccent and opmBg tokens to theme system"
```

---

## Task 2: Remove `textMuted`, `textOnBrand`, `neutral`; add `textNeutral` + `neutralBg`

**Files:**
- Modify: `src/themes/types.ts`
- Modify: `src/themes/cyprus.ts`
- Modify: `src/themes/derivationRules.ts`
- Modify: `src/__tests__/derivationRules.test.ts`

**Step 1: Update ThemeColors interface**

Remove these three lines:
- `textMuted: string;`
- `textOnBrand: string;`
- `neutral: string;`

Add these two lines in the Text section:
```typescript
textNeutral: string;        // neutral/real-value text (badge text for "neither good nor bad")
```

Add in the Semantic accents section:
```typescript
neutralBg: string;          // neutral badge background (derived from textNeutral)
```

**Step 2: Update derivation rules**

In `DARK_STATICS` and `LIGHT_STATICS`:
- Remove `textMuted`, `textOnBrand`, `neutral` entries
- Add `textNeutral` (dark: `'#e2e8f0'`, same as textSecondary; light: `'#334155'`, same as textSecondary)

In `applyDerivations` colors object:
- Remove `textMuted`, `textOnBrand`, `neutral` lines
- Add: `textNeutral: statics.textNeutral!,`
- Add: `neutralBg: hexToRgba(statics.textNeutral!, 0.10),`

Note: `neutralBg` is derived from `textNeutral` (not from a primary), so it lives in the derivation function but uses the static value as its source.

**Step 3: Update Cyprus theme**

- Remove `textMuted: '#cbd5e1'`
- Remove `textOnBrand: '#ffffff'`
- Remove `neutral: 'rgba(255, 255, 255, 0.10)'`
- Add `textNeutral: '#e2e8f0'` (same as textSecondary in Cyprus)
- Add `neutralBg: 'rgba(226, 232, 240, 0.10)'` (textNeutral at 0.10 alpha)

**Step 4: Update tests**

- Remove `textMuted`, `textOnBrand`, `neutral` assertions from `getModeStatics` tests
- Add `textNeutral` assertions (dark: `'#e2e8f0'`, light: `'#334155'`)
- Add test for `neutralBg` derivation (verifies it's textNeutral at alpha 0.10)

**Step 5: Run tests**

Run: `npm run test`
Expected: Pass

**Step 6: Commit**

```bash
git add src/themes/types.ts src/themes/cyprus.ts src/themes/derivationRules.ts src/__tests__/derivationRules.test.ts
git commit -m "feat: remove textMuted/textOnBrand/neutral, add textNeutral + neutralBg"
```

---

## Task 3: Update CSS var sync + Tailwind config

**Files:**
- Modify: `src/themes/syncCssVars.ts` (no structural changes needed; it iterates `theme.colors` dynamically)
- Modify: `tailwind.config.js`

**Step 1: Verify syncCssVars**

`syncCssVars` iterates `Object.entries(theme.colors)` and auto-generates CSS vars. Since we renamed/added tokens, the CSS vars will update automatically. No code change needed in syncCssVars itself.

**Step 2: Update tailwind.config.js**

Add new tokens, remove old ones:

```javascript
colors: {
  // ... existing surface, content sections ...
  content: {
    primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
    secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
    neutral: 'rgb(var(--color-text-neutral) / <alpha-value>)',  // NEW (replaces muted for Real Value)
    subtle: 'rgb(var(--color-text-subtle) / <alpha-value>)',
    // REMOVED: 'muted' — consumers use 'secondary' instead
    // REMOVED: 'on-brand' — consumers use hardcoded '#ffffff'
  },
  accent: {
    brand: 'rgb(var(--color-brand) / <alpha-value>)',
    'brand-bg': 'var(--color-brand-bg)',
    'brand-accent': 'rgb(var(--color-brand-accent) / <alpha-value>)',      // NEW
    'brand-accent-bg': 'var(--color-brand-accent-bg)',                      // NEW
    opm: 'rgb(var(--color-opm) / <alpha-value>)',
    'opm-bg': 'var(--color-opm-bg)',                                        // NEW
    returns: 'rgb(var(--color-returns) / <alpha-value>)',
    'returns-bg': 'var(--color-returns-bg)',
    'start-now': 'rgb(var(--color-start-now) / <alpha-value>)',
    'start-now-bg': 'var(--color-start-now-bg)',
    loss: 'rgb(var(--color-loss) / <alpha-value>)',
    'loss-bg': 'var(--color-loss-bg)',
    'neutral-bg': 'var(--color-neutral-bg)',                                // RENAMED from 'neutral'
  },
  // ... interactive section unchanged ...
}
```

**Step 3: Run build to check for Tailwind class errors**

Run: `npm run build`
Expected: Build succeeds (broken Tailwind classes are silent, but TypeScript errors from removed `textOnBrand` in consumers will surface)

**Step 4: Commit**

```bash
git add tailwind.config.js
git commit -m "feat: update Tailwind config for new token names"
```

---

## Task 4: Update App.tsx consumers

This is the biggest task. Every inline `theme.colors.*` reference and Tailwind class must be audited.

**Files:**
- Modify: `src/App.tsx`

**Changes:**

### 4a. Replace `textMuted` / `content-muted` consumers

All `content-muted` Tailwind classes and `theme.colors.textMuted` inline refs become `content-secondary` / `theme.colors.textSecondary`:

- Line 186: tooltip text `text-content-muted` → `text-content-secondary`
- Line 752: hero subhead `text-content-muted` → `text-content-secondary`
- Lines 995, 1012: table "Total Real" cells `text-content-muted` → `text-content-secondary`

### 4b. Replace `textOnBrand` consumers

Zero `textOnBrand` consumers in App.tsx (only in SettingsModal.tsx — handled in Task 5).

### 4c. Replace `neutral` / `neutralBg` consumers

Zero `neutral` / `accent-neutral` usage in App.tsx. No changes needed. (The Real Value badge in MetricCard doesn't use the neutral token currently; it will be wired up when the badge component is refactored, which is out of scope for this plan.)

### 4d. Add OPM background usage

Line 661 currently uses `theme.colors.brandBg` for OPM stat footer:
```typescript
// BEFORE
{ label: "Employer (OPM)", value: finalData['Employer Match'], colorStyle: { color: theme.colors.opm }, bgStyle: { background: theme.colors.brandBg }, icon: Building2 },

// AFTER
{ label: "Employer (OPM)", value: finalData['Employer Match'], colorStyle: { color: theme.colors.opm }, bgStyle: { background: theme.colors.opmBg }, icon: Building2 },
```

### 4e. Split returns vs brandAccent usage

The key question: which inline `theme.colors.returns` references should become `theme.colors.brandAccent`?

**Stays `returns`** (investment returns data):
- Line 629: chart legend `{ label: 'Investment Returns', color: theme.colors.returns, ... }`
- Line 659: stat footer "Market Funded" colorStyle/bgStyle
- Lines 902-903: chart area gradient `stopColor={theme.colors.returns}`
- Line 945: chart area stroke `stroke={theme.colors.returns}`
- Lines 960, 967, 968, 992, 993, 1009, 1010: table header/cell colors

**Becomes `brandAccent`** (brand accent, non-data):
- Line 855: "Add Start-Now" button active state background + boxShadow (this is the returns-colored *UI element*, not data)
- Line 337, 420, 429: section header `<h3>` colors (Timeline, Market, Strategy labels) — these use returns as an accent, not as data. Change to `brandAccent`.

**Step 1: Make the changes listed above**

**Step 2: Run lint + build**

Run: `npm run lint && npm run build`
Expected: Zero warnings, clean build

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: update App.tsx token consumers for restructure"
```

---

## Task 5: Update SettingsModal.tsx consumers

**Files:**
- Modify: `src/SettingsModal.tsx`

**Changes:**

Lines 169 and 182 use `theme.colors.textOnBrand`. Replace with `'#ffffff'` (hard-coded white, since text on a brand-colored background should always be white/high contrast regardless of mode):

```typescript
// BEFORE
style={{ backgroundColor: theme.colors.brand, color: theme.colors.textOnBrand }}

// AFTER
style={{ backgroundColor: theme.colors.brand, color: '#ffffff' }}
```

Alternatively, use `theme.colors.textPrimary` if we want it to be themeable. But the TODO says "elements assume textPrimary", and in dark mode both are `#ffffff`. In light mode, textPrimary becomes dark while on-brand text should stay white. So hard-code `'#ffffff'` here.

**Step 1: Make the changes**

**Step 2: Run lint + build**

Run: `npm run lint && npm run build`

**Step 3: Commit**

```bash
git add src/SettingsModal.tsx
git commit -m "feat: replace textOnBrand with hardcoded white in SettingsModal"
```

---

## Task 6: Update ThemeLab.tsx for token restructure

**Files:**
- Modify: `src/ThemeLab.tsx`

**Changes:**

### 6a. Update PRIMARY_KEYS

```typescript
const PRIMARY_KEYS = new Set<keyof ThemeColors>(['bg', 'brand', 'brandAccent', 'returns', 'loss', 'startNow', 'opm']);
```

### 6b. Update TOKEN_SECTIONS

Remove `textMuted`, `textOnBrand` from Text section. Remove `neutral`, add `neutralBg`. Add `brandAccent`, `brandAccentBg`, `opmBg`, `textNeutral`:

```typescript
{
  section: 'Text',
  tokens: [
    { key: 'textPrimary', label: 'Primary' },
    { key: 'textSecondary', label: 'Secondary' },
    { key: 'textNeutral', label: 'Neutral' },   // NEW (was textMuted for Real Value)
    { key: 'textSubtle', label: 'Subtle' },
    // REMOVED: textMuted (consumers → textSecondary)
    // REMOVED: textOnBrand (consumers → hardcoded white)
  ],
},
{
  section: 'Accents',
  tokens: [
    { key: 'brand', label: 'Brand' },
    { key: 'brandBg', label: 'Brand BG' },
    { key: 'brandAccent', label: 'Brand Accent' },   // NEW
    { key: 'brandAccentBg', label: 'Brand Accent BG' }, // NEW
    { key: 'opm', label: 'Employer (OPM)' },
    { key: 'opmBg', label: 'OPM BG' },               // NEW
    { key: 'returns', label: 'Returns' },
    { key: 'returnsBg', label: 'Returns BG' },
    { key: 'startNow', label: 'Start Now' },
    { key: 'startNowBg', label: 'Start Now BG' },
    { key: 'loss', label: 'Loss' },
    { key: 'lossBg', label: 'Loss BG' },
    { key: 'neutralBg', label: 'Neutral BG' },        // RENAMED
  ],
},
```

### 6c. Update Primaries section

Add `brandAccent` to the primary color pickers array (line 777):
```typescript
(['bg', 'brand', 'brandAccent', 'returns', 'loss', 'startNow', 'opm'] as const)
```

Update derived counts:
- `brand`: 5 (was 5, still: brandBg, focusRing, sliderAccent, sliderAccentHover, heroLine1Color)
- `brandAccent`: 7 (brandAccentBg, heroLine2Color, glow×3, blob×2)
- `returns`: 1 (returnsBg only now)
- `opm`: 1 (opmBg — was 0)

### 6d. Update flashPrimary derivedPaths

```typescript
const derivedPaths: Record<string, string[]> = {
  bg: ['colors.bgGlass', 'colors.bgCard', 'colors.bgInput', 'colors.bgMuted', 'colors.borderDefault'],
  brand: ['colors.brandBg', 'colors.focusRing', 'colors.sliderAccent', 'colors.sliderAccentHover', 'branding.heroLine1Color'],
  brandAccent: ['colors.brandAccentBg', 'branding.heroLine2Color', 'effects.glowColors.0', 'effects.glowColors.1', 'effects.glowColors.2', 'effects.blobs.0.color', 'effects.blobs.1.color'],
  returns: ['colors.returnsBg'],
  loss: ['colors.lossBg'],
  startNow: ['colors.startNowBg'],
  opm: ['colors.opmBg'],
};
```

### 6e. Update setPrimaryColor

The `opm` early return at line 546 should be removed since `opm` now has a derived token (`opmBg`). Let the normal derivation flow handle it.

**Step 1: Make all changes above**

**Step 2: Run tests, lint, build**

Run: `npm run test && npm run lint && npm run build`

**Step 3: Commit**

```bash
git add src/ThemeLab.tsx
git commit -m "feat: update ThemeLab for token restructure"
```

---

## Task 7: Theme Lab UX — Move mode toggle to own section

Per TODO: "move mode toggle above primaries section under Mode section"

**Files:**
- Modify: `src/ThemeLab.tsx`

**Changes:**

Move the mode toggle (currently inside Primaries, lines 754-774) to its own section above Primaries:

```tsx
{/* ── Mode ── */}
<SectionHeader label="Mode" />
<div className="flex items-center gap-1 mb-1 p-1 rounded-lg bg-white/5 w-fit">
  {/* ... existing mode toggle buttons ... */}
</div>

{/* ── Primaries ── */}
<SectionHeader label="Primaries" />
```

Also: set Theme Lab panel background to a neutral middle gray for all modes (keeping transparency + blur so elements flashing behind it are visible).

Replace the current `bg-[#0a1a19]/50` in the root div className (line 698) with `bg-neutral-500/50`. This provides a mode-neutral gray that works for both dark and light themes.

**Step 1: Make changes**

**Step 2: Visual verification** — open Theme Lab, confirm panel is middle gray with blur, elements visible behind it

**Step 3: Commit**

```bash
git add src/ThemeLab.tsx
git commit -m "feat: move mode toggle to own section, theme lab bg follows mode"
```

---

## Task 8: Theme Lab UX — Rename Branding section, move hero line colors to Text

Per TODO:
- "Rename Branding section to Branding Copy"
- "Move hero line 1 and 2 tokens to Text section"

**Files:**
- Modify: `src/ThemeLab.tsx`

**Changes:**

1. Change `<SectionHeader label="Branding" />` to `<SectionHeader label="Branding Copy" />`

2. Move the hero line color `ColorInput`s from the Branding section (lines 856-877) to after the Text TOKEN_SECTIONS block. Add them as additional `ColorInput`s rendered after the Text section's tokens. The cleanest approach: add `heroLine1Color` and `heroLine2Color` to the `TOKEN_SECTIONS` definition as a separate entry BELOW Text:

Actually, since hero line colors are `branding.*` paths (not `colors.*`), they can't go in TOKEN_SECTIONS which iterates `theme.colors[key]`. Instead, render them manually right after the Text section's mapped output. Use a check in the TOKEN_SECTIONS map: after rendering the Text section, inject the hero line color inputs.

**Step 1: Make changes**

**Step 2: Commit**

```bash
git add src/ThemeLab.tsx
git commit -m "feat: rename Branding to Branding Copy, move hero colors to Text"
```

---

## Task 9: Theme Lab UX — Always show reset buttons + improve lock icon contrast

Per TODO:
- "Hex inputs need to be aligned (currently, we only show reset button when unlocked and nudge input to left when showing reset. simple solution is to always show reset buttons as we do with primaries)"
- Improve contrast of lock/unlock icon states (both on and off)

**Files:**
- Modify: `src/ThemeLab.tsx`

**Changes:**

In the `ColorInput` component, always show the reset button regardless of lock state. Currently:
- Lines 204-214: reset button shown only when `!hasLockBehavior`
- Lines 215-228: reset+relock button shown only when `hasLockBehavior && !isLocked`

Change to: always show a reset button. When locked, it resets AND relocks. When unlocked, it resets AND relocks. When no lock behavior, it just resets.

Simplify to a single reset button that always renders:

```tsx
<button
  type="button"
  onClick={() => {
    if (!isDefault) {
      onChange(defaultValue);
      onRelock?.();
    }
  }}
  className={`p-0.5 shrink-0 transition-colors ${isDefault ? 'text-white/[0.06] cursor-default' : 'text-white/30 hover:text-white/60'}`}
  title="Reset to default"
  aria-disabled={isDefault}
>
  <RotateCcw size={10} />
</button>
```

Remove the two conditional blocks (lines 204-228) and replace with this single block.

Also improve lock/unlock icon contrast. Current classes:
- Locked: `text-white/20 hover:text-white/40` (too faint)
- Unlocked: `text-teal-400/70 hover:text-teal-400` (decent but could be stronger)

Change to:
- Locked: `text-white/40 hover:text-white/60`
- Unlocked: `text-teal-400 hover:text-teal-300`

**Step 1: Make changes**

**Step 2: Verify alignment** — all hex inputs and reset buttons should be aligned across all rows. Verify lock icons are more visible.

**Step 3: Commit**

```bash
git add src/ThemeLab.tsx
git commit -m "feat: always show reset button for consistent alignment"
```

---

## Task 10: Cyprus theme color defaults

Per TODO:
- New Loss token default: `#FF4444`
- New Start now token default: `#00BBBB`
- New OPM token default: `#9DE093` (granny smith apple)

**Files:**
- Modify: `src/themes/cyprus.ts`
- Modify: `src/__tests__/derivationRules.test.ts` (update cyprusPrimaries)

**Step 1: Update cyprus.ts**

```typescript
loss: '#FF4444',           // was '#D32F2F'
lossBg: 'rgba(255, 68, 68, 0.07)',  // derived will auto-update, but static definition should match
startNow: '#00BBBB',      // was '#0D9488'
startNowBg: 'rgba(0, 187, 187, 0.08)',
```

OPM: `#9DE093` (granny smith apple) — confirmed by user.

**Step 2: Update test cyprusPrimaries**

```typescript
const cyprusPrimaries: Primaries = {
  bg: '#003D3A',
  brand: '#00A499',
  brandAccent: '#E6C300',
  returns: '#E6C300',
  loss: '#FF4444',          // updated
  startNow: '#00BBBB',     // updated
  opm: '#9DE093',          // granny smith apple
};
```

**Step 3: Update derived color assertions** that compare against hardcoded Cyprus values (lossBg, startNowBg rgba strings will change)

**Step 4: Run tests**

Run: `npm run test`

**Step 5: Commit**

```bash
git add src/themes/cyprus.ts src/__tests__/derivationRules.test.ts
git commit -m "feat: update Cyprus color defaults (loss, startNow, opm)"
```

---

## Task 11: Remove Start-Now button color fix

Per TODO: "Remove start now button should be linked to start now token (currently linked to brand)"

**Files:**
- Modify: `src/App.tsx`

**Changes:**

Line 855 — the "Remove Start-Now" / "Add Start-Now" button:

Currently when active (`showImmediateLine` is true), it uses `accent-brand` classes:
```
border border-accent-brand/40 text-accent-brand hover:bg-accent-brand/10
```

Change to use `accent-start-now`:
```
border border-accent-start-now/40 text-accent-start-now hover:bg-accent-start-now/10
```

The inactive state (button styled with `theme.colors.returns` background) was changed to `brandAccent` in Task 4. But actually, this button should use `startNow` for both states since it's the Start Now toggle:

Active state (showing "Remove Start-Now"): `border-accent-start-now/40 text-accent-start-now`
Inactive state (showing "Add Start-Now"): `background: theme.colors.startNow`

Wait — the inactive state currently shows a filled button with returns color. Per the TODO, it should use startNow. Update:

```typescript
style={!showImmediateLine ? { background: theme.colors.startNow, boxShadow: `0 4px 6px ${theme.colors.startNowBg}` } : undefined}
```

**Step 1: Make changes**

**Step 2: Run lint + build**

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "fix: link Start-Now button colors to startNow token"
```

---

## Task 12: Recharts tooltip improvements

Per TODO inbox:
- Hover tooltip needs to include the total (target) projection; place below the rest, thin line above
- "Start Now Total" → "Start Now Difference" in key (represents |potential loss|)
- When start now on, tooltip replaces bottom target projection with start early target projection and displays Start Now Difference at top

**Files:**
- Modify: `src/App.tsx` (CustomTooltip component and chart legend)

This task requires understanding the Recharts tooltip customization. The app already has a custom tooltip (search for `CustomTooltip` or the tooltip render in the chart).

**Step 1: Find and read the current tooltip implementation**

Look for the `<Tooltip>` component inside the `<AreaChart>`.

**Step 2: Add total projection row**

Add a row at the bottom of the tooltip showing the sum of all visible series values. Style with `textPrimary` token, thin line (1px, subtle color) above it.

**Step 3: Rename "Start Now Total" to "Start Now Difference"**

In the chart legend (line 632):
```typescript
// BEFORE
{ label: 'Start Now Total', color: theme.colors.startNow, visible: isDelayed && showImmediateLine }

// AFTER
{ label: 'Start Now Difference', color: theme.colors.startNow, visible: isDelayed && showImmediateLine }
```

The value should show `|potential loss|` = difference between start-now total and delayed total.

**Step 4: When start now is on, tooltip behavior changes**

- Bottom row shows "Start Early Target Projection" (sum of immediate-start series) instead of regular "Target Projection"
- Top of tooltip shows "Start Now Difference" (difference between immediate total and delayed total)

**Step 5: Run lint + build**

**Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "feat: enhance Recharts tooltip with target projection and start-now difference"
```

---

## Task 13: Final verification

**Step 1: Run full test suite**

Run: `npm run test`
Expected: All tests pass

**Step 2: Run lint**

Run: `npm run lint`
Expected: Zero warnings

**Step 3: Run build**

Run: `npm run build`
Expected: Clean build

**Step 4: Manual testing checklist for user**

- [ ] Open Theme Lab — verify all new tokens appear in correct sections
- [ ] Change `brandAccent` primary — verify hero line 2, blobs, glows update
- [ ] Change `returns` primary — verify only chart/table data colors update
- [ ] Change `opm` primary — verify OPM stat footer background updates
- [ ] Flash each primary — verify correct elements flash
- [ ] Toggle dark/light/auto mode — verify Theme Lab bg changes, tokens re-derive
- [ ] Verify "Remove Start-Now" button uses startNow color
- [ ] Verify OPM stat icon uses `opmBg` background (not brandBg)
- [ ] Verify section headers (Timeline, Market, Strategy) use `brandAccent` color
- [ ] Verify tooltip shows total projection row
- [ ] Check Cyprus colors: loss is brighter red, startNow is cyan, opm is green
- [ ] Verify no console errors

---

## Dependency Graph

```
Task 1 (types + derivation) ─┬─> Task 3 (Tailwind) ──> Task 4 (App.tsx consumers)
Task 2 (remove/rename)       ┘                    ──> Task 5 (SettingsModal consumers)
                                                   ──> Task 6 (ThemeLab token sections)
Task 7 (mode toggle UX)         # independent
Task 8 (rename branding UX)     # independent
Task 9 (reset button UX)        # independent
Task 10 (Cyprus defaults)       # depends on Task 1
Task 11 (Start-Now button)      # depends on Task 4
Task 12 (Recharts tooltip)      # independent
Task 13 (verification)          # depends on all
```

Tasks 1-2 must go first. Then 3. Then 4-6 can be parallelized. Tasks 7-9 are independent UX changes. Task 10 depends on 1. Task 11 depends on 4. Task 12 is independent. Task 13 is last.
