# Theme Switcher Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a theme selector to the Settings modal so users can switch between installed themes with a live preview card UI.

**Architecture:** A `getSelectableThemes()` helper filters the theme registry (hiding `playground` and QA-locked fixtures). SettingsModal renders mini preview cards in a flex-wrap row, each showing the theme's bg/name/color dots. Clicking a card calls `setThemeId()` for immediate switching and closes Theme Lab if open.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, existing theme system (`themes/index.ts`, `ThemeProvider`, `useTheme`)

---

### Task 1: Add `getSelectableThemes()` helper to theme registry

**Files:**
- Modify: `src/themes/index.ts`
- Test: `src/__tests__/themeRegistry.test.ts`

**Step 1: Write the failing test**

Add to `src/__tests__/themeRegistry.test.ts`:

```typescript
import { getSelectableThemes } from '../themes/index';

describe('getSelectableThemes', () => {
  it('returns themes excluding playground and locked fixtures', () => {
    const selectable = getSelectableThemes();
    const ids = selectable.map(t => t.id);
    expect(ids).not.toContain('playground');
    expect(ids).not.toContain('cyprusLocked');
    expect(ids).toContain('cyprus');
  });

  it('returns array of ThemeConfig objects', () => {
    const selectable = getSelectableThemes();
    expect(selectable.length).toBeGreaterThan(0);
    for (const t of selectable) {
      expect(t).toHaveProperty('id');
      expect(t).toHaveProperty('name');
      expect(t).toHaveProperty('colors');
    }
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- --reporter=verbose 2>&1 | grep -A 2 'getSelectableThemes'`
Expected: FAIL — `getSelectableThemes` is not exported

**Step 3: Write minimal implementation**

In `src/themes/index.ts`, add:

```typescript
/** Themes available in the user-facing theme switcher (hides playground + QA fixtures). */
export const getSelectableThemes = (): ThemeConfig[] =>
  Object.values(themes).filter(
    (t) => t.id !== 'playground' && !t.id.toLowerCase().includes('locked')
  );
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- --reporter=verbose 2>&1 | grep -A 2 'getSelectableThemes'`
Expected: PASS

**Step 5: Commit**

```bash
git add src/themes/index.ts src/__tests__/themeRegistry.test.ts
git commit -m "feat: add getSelectableThemes helper to theme registry"
```

---

### Task 2: Add `onCloseThemeLab` prop to SettingsModal

**Files:**
- Modify: `src/SettingsModal.tsx` (interface + prop destructure only)
- Modify: `src/Root.tsx` (pass `closeLab` as new prop)

**Step 1: Add the prop to SettingsModalProps interface**

In `src/SettingsModal.tsx`, update the interface:

```typescript
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenThemeLab: () => void;
  onCloseThemeLab: () => void;  // NEW
  showFab: boolean;
  onToggleFab: (value: boolean) => void;
}
```

Add `onCloseThemeLab` to the destructured props in the component signature.

**Step 2: Wire the prop in Root.tsx**

In `src/Root.tsx`, update the `<SettingsModal>` JSX:

```tsx
<SettingsModal
  isOpen={settingsOpen}
  onClose={closeSettings}
  onOpenThemeLab={openLab}
  onCloseThemeLab={closeLab}
  showFab={showFab}
  onToggleFab={setShowFab}
/>
```

**Step 3: Run lint and build to verify no regressions**

Run: `npm run lint && npm run build`
Expected: Clean (0 warnings, 0 errors)

**Step 4: Commit**

```bash
git add src/SettingsModal.tsx src/Root.tsx
git commit -m "feat: add onCloseThemeLab prop to SettingsModal"
```

---

### Task 3: Build the Theme Switcher section UI

**Files:**
- Modify: `src/SettingsModal.tsx`

**Step 1: Add theme imports**

At the top of `src/SettingsModal.tsx`, add:

```typescript
import { getSelectableThemes } from './themes/index';
```

The component already imports `useTheme`.

**Step 2: Build the ThemeSwitcher section component**

Add inside `SettingsModal.tsx` (above the exported component), a local `ThemeSwitcherSection` component:

```tsx
const SWATCH_KEYS = ['brand', 'returns', 'loss', 'opm'] as const;

const ThemeSwitcherSection = ({
  onCloseThemeLab,
}: {
  onCloseThemeLab: () => void;
}) => {
  const { theme: activeTheme, themeId, setThemeId } = useTheme();
  const selectableThemes = getSelectableThemes();

  const handleSelect = (id: string) => {
    if (id === themeId) return;
    onCloseThemeLab();
    setThemeId(id);
  };

  return (
    <section>
      <h3 className="text-[11px] font-black uppercase tracking-widest text-content-secondary mb-3">
        Theme
      </h3>
      <div className="flex flex-wrap gap-3">
        {selectableThemes.map((t) => {
          const isActive = t.id === themeId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelect(t.id)}
              className={`relative w-[120px] h-[70px] rounded-xl border-2 transition-all overflow-hidden flex flex-col items-start justify-between p-2.5 ${
                isActive
                  ? 'ring-2 ring-offset-1'
                  : 'border-white/10 hover:border-white/25'
              }`}
              style={{
                backgroundColor: t.colors.bg,
                borderColor: isActive ? activeTheme.colors.brand : undefined,
                ringColor: isActive ? activeTheme.colors.brand : undefined,
                // For ring utility: use box-shadow as ring since Tailwind ring color
                // needs to come from the active theme, not the card's theme
                boxShadow: isActive
                  ? `0 0 0 2px ${activeTheme.colors.brand}`
                  : undefined,
              }}
              aria-label={`Switch to ${t.name} theme`}
              aria-pressed={isActive}
            >
              <span
                className="text-xs font-bold truncate max-w-full"
                style={{ color: t.colors.textPrimary }}
              >
                {t.name}
              </span>
              <div className="flex gap-1.5">
                {SWATCH_KEYS.map((key) => (
                  <div
                    key={key}
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: t.colors[key] }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
```

**Step 3: Add the section to the modal body**

In the modal body `<div>`, add `ThemeSwitcherSection` as the first section (above Theme Lab):

```tsx
{/* Body */}
<div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-8">
  {/* Theme Switcher Section */}
  <ThemeSwitcherSection onCloseThemeLab={onCloseThemeLab} />

  {/* Theme Lab Section */}
  <section>
    ...
```

**Step 4: Run lint and build**

Run: `npm run lint && npm run build`
Expected: Clean

**Step 5: Visual QA**

Run: `npm run dev`

Verify:
- Theme section appears above Theme Lab in Settings
- Cyprus card shows with teal bg, white name text, 4 color dots
- Active card has brand-colored ring
- Only Cyprus shows (playground and cyprusLocked are hidden)
- Clicking the active card does nothing (no-op guard)

**Step 6: Commit**

```bash
git add src/SettingsModal.tsx
git commit -m "feat: add theme switcher section to Settings modal"
```

---

### Task 4: Verify Theme Lab close-on-switch behavior

**Step 1: Manual test**

1. Open Theme Lab via FAB or Settings
2. Open Settings modal (gear icon)
3. Switch to a different theme (once more themes exist; for now, verify the `onCloseThemeLab()` call fires by adding a temporary `console.log`)
4. Confirm Theme Lab closes

**Step 2: Run full test suite**

Run: `npm run test`
Expected: All 131+ tests pass

**Step 3: Run full verification**

Run: `npm run lint && npm run test && npm run build`
Expected: All clean

**Step 4: Commit (if any fixes needed)**

---

### Task 5: Final cleanup and verification

**Step 1: Run full verification**

Run: `npm run lint && npm run test && npm run build`
Expected: All clean, zero warnings

**Step 2: Commit all remaining changes**

Ensure all files are committed on the `theme-switcher` branch.
