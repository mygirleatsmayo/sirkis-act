# Theme Design Compatibility Implementation Plan

**Goal:** Implement a robust theme compatibility layer (capabilities + editor metadata + resolver) and global disclosure popover UX so new themes can be built in parallel without runtime drift.

**Architecture:** Add a pure runtime normalization layer (`resolveTheme`) that supplies safe defaults for optional theme behavior while preserving explicit per-theme tokens. Wire render guards in `App.tsx` and `SettingsModal.tsx` to resolved capabilities/editor metadata. Keep disclosure app-global and implement it as lightweight responsive popovers in existing layout surfaces.

**Tech Stack:** React 19, TypeScript 5.7 (strict), Vitest, Tailwind CSS, existing ThemeProvider/theme registry.

---

### Task 1: Runtime Theme Contract and Resolver

**Files:**
- Create: `src/themes/resolveTheme.ts`
- Modify: `src/themes/types.ts`
- Modify: `src/themes/index.ts`
- Test: `src/__tests__/resolveTheme.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { resolveTheme } from '../themes/resolveTheme';
import { cyprusTheme } from '../themes/cyprus';

describe('resolveTheme', () => {
  it('fills capability defaults when omitted', () => {
    const resolved = resolveTheme({ ...cyprusTheme, capabilities: undefined });
    expect(resolved.capabilities.showHero).toBe(true);
    expect(resolved.capabilities.showSirkisms).toBe(true);
  });

  it('preserves explicit token overrides', () => {
    const resolved = resolveTheme({
      ...cyprusTheme,
      colors: { ...cyprusTheme.colors, textSecondary: '#800080' },
    });
    expect(resolved.colors.textSecondary).toBe('#800080');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/resolveTheme.test.ts`  
Expected: FAIL (missing `resolveTheme` and/or new metadata fields).

**Step 3: Write minimal implementation**

```ts
// resolveTheme.ts
export const DEFAULT_THEME_CAPABILITIES = { /* showHero, showSirkisms, etc. */ } as const;
export const DEFAULT_THEME_EDITOR = { kind: 'studio' } as const;

export const resolveTheme = (theme: ThemeConfig): ResolvedThemeConfig => ({
  ...theme,
  capabilities: { ...DEFAULT_THEME_CAPABILITIES, ...theme.capabilities },
  editor: { ...DEFAULT_THEME_EDITOR, ...theme.editor },
});
```

Also update `ThemeConfig` types to include:
- `capabilities?: Partial<ThemeCapabilities>`
- `editor?: Partial<ThemeEditorConfig>`

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/resolveTheme.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/themes/types.ts src/themes/index.ts src/themes/resolveTheme.ts src/__tests__/resolveTheme.test.ts
git commit -m "feat: add runtime theme resolver with capability defaults"
```

---

### Task 2: Theme Registry Compatibility Invariants

**Files:**
- Modify: `src/themes/cyprus.ts`
- Modify: `src/themes/playground.ts`
- Test: `src/__tests__/themeRegistry.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { themes } from '../themes';
import { resolveTheme } from '../themes/resolveTheme';

describe('theme registry compatibility', () => {
  it('resolves all registered themes without missing runtime metadata', () => {
    Object.values(themes).forEach((theme) => {
      const resolved = resolveTheme(theme);
      expect(resolved.capabilities).toBeDefined();
      expect(resolved.editor.kind).toMatch(/studio|locked/);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/themeRegistry.test.ts`  
Expected: FAIL until theme objects include intended metadata.

**Step 3: Write minimal implementation**

- Set Cyprus defaults explicitly:
  - `editor.kind = 'studio'`
  - `capabilities.showSirkisms = true` (Cyprus-specific)
- Ensure Playground inherits studio defaults and capability shape.

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/themeRegistry.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/themes/cyprus.ts src/themes/playground.ts src/__tests__/themeRegistry.test.ts
git commit -m "test: enforce theme registry compatibility invariants"
```

---

### Task 3: Capability-Aware Rendering in App Shell

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/themes/ThemeProvider.tsx` (only if resolved theme should be provided globally)
- Test: `src/__tests__/resolveTheme.test.ts` (extend coverage for rendering assumptions)

**Step 1: Extend failing test**

Add resolver expectation coverage for:
- `showHeroLine2=false`
- `showSubhead=false`
- `logoColorMode='intrinsic'`
- `subheadMode='plain'`

Expected behavior encoded as resolved flags.

**Step 2: Run targeted test**

Run: `npx vitest run src/__tests__/resolveTheme.test.ts`  
Expected: FAIL until flags/default interactions are finalized.

**Step 3: Implement minimal rendering changes**

In `App.tsx`, gate these blocks off resolved capabilities:
- mobile + desktop logo coloring (`themed` vs `intrinsic`)
- tagline visibility
- hero visibility
- hero line 2 visibility
- subhead visibility + structured/plain rendering
- Sirkisms carousel visibility

Keep existing layout stable when all defaults are enabled.

**Step 4: Run tests**

Run: `npx vitest run src/__tests__/resolveTheme.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/App.tsx src/themes/ThemeProvider.tsx src/__tests__/resolveTheme.test.ts
git commit -m "feat: gate app branding surfaces by resolved theme capabilities"
```

---

### Task 4: Theme Lab Access Gating for Locked Themes

**Files:**
- Modify: `src/SettingsModal.tsx`
- Modify: `src/themes/useTheme.ts` (only if metadata access helpers are needed)
- Test: `src/__tests__/resolveTheme.test.ts` or `src/__tests__/themeRegistry.test.ts`

**Step 1: Write failing test (metadata rule)**

Add expectation that a theme with `editor.kind='locked'` remains valid after resolution and has `themeLabEditable=false` behavior through helper logic.

**Step 2: Run targeted test**

Run: `npx vitest run src/__tests__/themeRegistry.test.ts`  
Expected: FAIL until helper rule is implemented.

**Step 3: Implement minimal UI behavior**

- In Settings modal:
  - if current theme is `studio`: keep "Open Theme Lab" enabled.
  - if `locked`: disable button and show concise helper copy (e.g., “This theme is brand-locked.”).
- Do not remove Theme Lab itself; only gate access from current theme context.

**Step 4: Run tests**

Run: `npx vitest run src/__tests__/themeRegistry.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/SettingsModal.tsx src/__tests__/themeRegistry.test.ts
git commit -m "feat: gate theme lab access for locked themes"
```

---

### Task 5: Global Disclosure Popover (Responsive Placement)

**Files:**
- Modify: `src/App.tsx`

**Step 1: Add failing behavioral checklist (manual QA first)**

Manual checklist:
- Desktop: `Investing Disclosure` appears at top-right main content.
- Mobile: link appears only inside opened drawer, opposite Timeline heading.
- Trigger opens compact popover with full copy immediately.
- Outside click / Escape / re-click closes popover.

**Step 2: Implement minimal popover UI**

Add app-global constants and state in `App.tsx`:
- disclosure copy string
- open/close state
- outside-click + Escape handlers

Render placements:
- desktop main content top-right
- mobile drawer section header row (Timeline opposite side)

Popover style should reuse existing token language (`bgGlass`, `textPrimary`, border subtle).

**Step 3: Verify behavior manually + run baseline checks**

Run:
- `npm run lint`
- `npm run test`
- `npm run build`

Expected:
- All pass.
- Manual checklist passes in desktop and mobile viewport simulation.

**Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add global investing disclosure popover with responsive placement"
```

---

### Task 6: Final Verification and Documentation Sync

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `src/changelog.ts` (if shipping in-app release notes now)
- Modify: `SESSION_LOG.md` (session milestone entry)

**Step 1: Verify clean integrated state**

Run:
- `npm run lint`
- `npm run test`
- `npm run build`
- `git status --short`

Expected:
- clean quality gates
- expected docs-only deltas (if any)

**Step 2: Update docs**

- Add concise changelog entry for:
  - runtime theme resolver/capability contract
  - locked-theme Theme Lab gating
  - disclosure popover behavior

**Step 3: Commit docs**

```bash
git add CHANGELOG.md src/changelog.ts SESSION_LOG.md
git commit -m "docs: record theme compatibility and disclosure updates"
```

---

## Execution Notes

- Keep each task small and independently reversible.
- Prefer additive changes and pure helpers over broad refactors.
- Do not start implementation until this plan is explicitly approved.

---

## Manual QA Acceptance Checklist

Use this checklist to determine whether the implementation works as intended.

### 1) Setup

- Run `npm run dev`.
- Validate at desktop (`>=1024px`) and mobile (`<=639px`) viewports.
- Ensure registry includes:
  - one Studio full theme (Cyprus-like),
  - one Studio minimal theme (hero line 2/subhead/sirkisms disabled),
  - one Locked theme (`editor.kind='locked'`, intrinsic logo mode).

### 2) Studio Full Baseline

- Confirm logo, tagline, hero line 1 + line 2, subhead, and Sirkisms all render.
- Confirm baseline visual behavior remains unchanged when all capabilities are enabled.

### 3) Studio Minimal Capability Gating

- Switch to the minimal Studio theme.
- Confirm disabled elements are fully hidden.
- Confirm layout remains clean (no empty spacer artifacts or broken alignment).

### 4) Subhead Mode Behavior

- `subheadMode='structured'`: emphasis span renders correctly.
- `subheadMode='plain'`: plain subhead renders with no structured fragments.

### 5) Logo Color Mode Behavior

- `logoColorMode='themed'`: logo follows theme color token.
- `logoColorMode='intrinsic'`: logo is not force-tinted by theme styling.

### 6) Theme Lab Access Rules

- Studio theme: Theme Lab entry is enabled and opens normally.
- Locked theme: Theme Lab entry is disabled with clear helper copy.
- Switching back to Studio re-enables Theme Lab immediately.

### 7) Disclosure Placement

- Desktop: `Investing Disclosure` appears top-right of main content.
- Mobile: link appears only inside opened drawer near Timeline heading.
- Mobile collapsed drawer handle does not show disclosure link.

### 8) Disclosure Interaction

- Trigger opens popover with full copy immediately.
- Re-click trigger closes popover.
- Outside click/tap closes popover.
- Escape closes popover.
- On mobile, disclosure interaction does not close the drawer.

### 9) Responsiveness and Regression Sweep

- Resize between desktop and mobile with disclosure closed and open.
- Confirm no overlap with chart controls, header, drawer controls, or key CTA buttons.
- Confirm main calculator workflows still work (inputs, Start-Now toggle, chart/table toggle).

### 10) Final Gate

- `npm run lint` passes.
- `npm run test` passes.
- `npm run build` passes.
- Browser console shows no new errors during QA.
