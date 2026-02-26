# Settings Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Settings modal with gear icon trigger, Theme Studio launch point, changelog display, and tour replay stub. Remove the Ctrl+Shift+T shortcut and always-on FAB; gate FAB behind an opt-in toggle.

**Architecture:** New `SettingsModal` component renders a centered modal (desktop) or full-screen panel (mobile). State lives in `Root.tsx` alongside existing Theme Lab state. The gear icon is added to both the mobile header and desktop sidebar header in `App.tsx`, receiving an `onOpenSettings` callback prop.

**Tech Stack:** React 19, TypeScript strict, Tailwind CSS semantic tokens, Lucide React icons. No new dependencies.

**Design doc:** `docs/plans/2026-02-25-settings-modal-design.md`

---

### Task 1: Add `onOpenSettings` prop to App

**Files:**
- Modify: `src/types.ts`
- Modify: `src/App.tsx:501-506`

**Step 1: Add prop to App**

In `src/App.tsx`, change the App component to accept an optional callback prop. Add the prop type inline (App is not currently typed via an interface):

```tsx
// src/App.tsx line 501
const App = ({ onOpenSettings }: { onOpenSettings?: () => void }) => {
```

**Step 2: Add gear icon to mobile header**

In `src/App.tsx`, add a `Settings` icon import from lucide-react (line 12-24 import block), then add the gear button inside the mobile header `<div role="banner">` (line 706). Place it as the last child, right-aligned:

```tsx
// Add to lucide-react imports:
Settings as SettingsIcon,

// Inside the mobile header div (after the brand div that closes around line 718):
{onOpenSettings && (
  <button
    type="button"
    onClick={onOpenSettings}
    aria-label="Open settings"
    className="p-2 rounded-xl text-content-subtle hover:text-white hover:bg-white/10 transition-colors"
  >
    <SettingsIcon size={20} />
  </button>
)}
```

**Step 3: Add gear icon to desktop sidebar branding**

In `src/App.tsx`, inside the desktop sidebar branding block (line 311-321 area), wrap the existing brand content and gear icon in a flex row with `justify-between`:

```tsx
{!isMobile && (
<div className="mb-8 pt-2">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2.5" style={{ color: theme.colors.brand }}>
<Logo className="h-9 w-9" />
<div>
<div className="font-display font-black text-xl tracking-tight leading-tight">{theme.branding.appName}</div>
<div className="text-[10px] font-medium text-content-subtle leading-tight">{theme.branding.tagline}</div>
</div>
</div>
{onOpenSettings && (
  <button
    type="button"
    onClick={onOpenSettings}
    aria-label="Open settings"
    className="p-2 rounded-xl text-content-subtle hover:text-white hover:bg-white/10 transition-colors"
  >
    <SettingsIcon size={18} />
  </button>
)}
</div>
</div>
)}
```

Note: The `onOpenSettings` prop threads through from `SettingsPanel` — but the gear icon lives in the sidebar branding section which is inside `SettingsPanel`. So `SettingsPanelProps` also needs the callback:

In `src/types.ts`, add to `SettingsPanelProps`:

```ts
export type SettingsPanelProps = {
  inputs: Inputs;
  handleInputChange: (key: keyof Inputs | 'RESET', value: number | string | boolean) => void;
  formatCurrency: (value: number) => string;
  isMobile?: boolean;
  onOpenSettings?: () => void;
};
```

Update `SettingsPanel` function signature (line 294) to destructure `onOpenSettings`.

**Step 4: Verify build**

Run: `npm run build`
Expected: passes (gear icon renders nothing yet since prop isn't wired)

**Step 5: Commit**

```bash
git add src/App.tsx src/types.ts
git commit -m "feat(settings): add gear icon to mobile header and desktop sidebar"
```

---

### Task 2: Create SettingsModal component

**Files:**
- Create: `src/SettingsModal.tsx`

**Step 1: Write the modal component**

```tsx
import { useEffect, useRef } from 'react';
import { X, Palette } from 'lucide-react';
import { useTheme } from './themes/useTheme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenThemeLab: () => void;
  showFab: boolean;
  onToggleFab: (value: boolean) => void;
}

const APP_VERSION = '1.1.0-rc.1';

const CHANGELOG_ENTRIES = [
  {
    version: '1.1.0-rc.1',
    date: '2026-02-25',
    title: 'Theme Architecture & Theme Lab',
    items: [
      'Runtime theme system with CSS variable sync and Tailwind semantic tokens',
      'Theme Lab: live-editing panel for colors, fonts, SVG logos, and branding',
      'SVG sanitization via DOMPurify',
      'TypeScript project references for cleaner builds',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-02-24',
    title: 'Code Quality & Infrastructure',
    items: [
      'Module extraction, MetricCard component, performance optimization',
      'Unit tests (33 tests), accessibility audit, ESLint v9',
      'Meta tags, SEO, and retroactive versioning',
    ],
  },
  {
    version: '0.9.0',
    date: '2026-02-21',
    title: 'UX Polish & Copy',
    items: [
      'Loss panel responsive sizing and copy improvements',
      'Stat icon radius and icon updates',
    ],
  },
];

export const SettingsModal = ({
  isOpen,
  onClose,
  onOpenThemeLab,
  showFab,
  onToggleFab,
}: SettingsModalProps) => {
  const { theme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap and Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Focus the modal on open
    modalRef.current?.focus();

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOpenThemeLab = () => {
    onClose();
    // Small delay so the modal close animation completes before Theme Lab opens
    requestAnimationFrame(() => onOpenThemeLab());
  };

  return (
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-surface-overlay backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-lg mx-4 max-h-[85vh] flex flex-col bg-surface-glass border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 outline-none
          max-sm:fixed max-sm:inset-0 max-sm:max-w-none max-sm:mx-0 max-sm:max-h-none max-sm:rounded-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg font-display font-bold text-content-primary">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 rounded-lg text-content-subtle hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-8">
          {/* Theme Studio Section */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-content-subtle">
                Theme Studio
              </h3>
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: theme.colors.brand, color: theme.colors.textOnBrand }}
              >
                Beta
              </span>
            </div>
            <p className="text-sm text-content-muted mb-4">
              Customize colors, fonts, and branding with{' '}
              <span className="whitespace-nowrap">a live preview.</span>
            </p>
            <button
              type="button"
              onClick={handleOpenThemeLab}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors"
              style={{ backgroundColor: theme.colors.brand, color: theme.colors.textOnBrand }}
            >
              <Palette size={16} />
              Open Theme Studio
            </button>
            <label className="flex items-center gap-3 mt-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showFab}
                  onChange={(e) => onToggleFab(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 rounded-full bg-white/15 peer-checked:bg-accent-brand transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-content-secondary">
                  Show floating button
                </span>
                <span className="block text-[11px] text-content-subtle">
                  Quick access while editing
                </span>
              </div>
            </label>
          </section>

          {/* Changelog Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-content-subtle">
                Changelog
              </h3>
              <span className="text-[11px] font-bold text-content-subtle">
                v{APP_VERSION}
              </span>
            </div>
            <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {CHANGELOG_ENTRIES.map((entry) => (
                <div key={entry.version}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-bold text-content-secondary">
                      v{entry.version}
                    </span>
                    <span className="text-[10px] text-content-subtle">{entry.date}</span>
                  </div>
                  <p className="text-xs font-semibold text-content-muted mb-1">{entry.title}</p>
                  <ul className="space-y-0.5">
                    {entry.items.map((item, i) => (
                      <li key={i} className="text-[11px] text-content-subtle pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-content-subtle">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Welcome Tour Section (stub) */}
          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-content-subtle mb-2">
              Welcome Tour
            </h3>
            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-xl text-sm font-bold text-content-subtle/50 bg-white/5 border border-white/5 cursor-not-allowed"
            >
              Replay Tour
            </button>
            <span className="ml-2 text-[11px] text-content-subtle/50">(Coming soon)</span>
          </section>
        </div>
      </div>
    </div>
  );
};
```

**Step 2: Verify build**

Run: `npm run build`
Expected: passes (component exists but isn't mounted yet)

**Step 3: Commit**

```bash
git add src/SettingsModal.tsx
git commit -m "feat(settings): create SettingsModal component"
```

---

### Task 3: Wire up Root.tsx — state management and component mounting

**Files:**
- Modify: `src/Root.tsx`

**Step 1: Rewrite Root.tsx**

Replace the entire contents of `src/Root.tsx`:

```tsx
import { useState, useCallback } from "react";
import App from "./App";
import { ThemeProvider } from "./themes/ThemeProvider";
import { ThemeLab } from "./ThemeLab";
import { SettingsModal } from "./SettingsModal";
import { Palette } from "lucide-react";

export const Root = () => {
  const [labOpen, setLabOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const openLab = useCallback(() => setLabOpen(true), []);
  const closeLab = useCallback(() => setLabOpen(false), []);

  return (
    <ThemeProvider>
      <App onOpenSettings={openSettings} />
      <ThemeLab isOpen={labOpen} onClose={closeLab} />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={closeSettings}
        onOpenThemeLab={openLab}
        showFab={showFab}
        onToggleFab={setShowFab}
      />
      {/* Opt-in FAB for Theme Lab quick access */}
      {showFab && !labOpen && !settingsOpen && (
        <button
          type="button"
          onClick={openLab}
          aria-label="Open Theme Lab"
          className="fixed bottom-24 lg:bottom-6 right-4 z-[9998] p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white/60 hover:text-white hover:bg-black/80 shadow-lg transition-all hover:scale-110"
        >
          <Palette size={18} />
        </button>
      )}
    </ThemeProvider>
  );
};
```

Key changes from previous Root.tsx:
- Removed `Ctrl+Shift+T` keyboard shortcut and `useEffect`
- Added `settingsOpen` and `showFab` state
- FAB now gated behind `showFab` (off by default) and also hides when settings modal is open
- Mounts `SettingsModal` with all required props

**Step 2: Verify build**

Run: `npm run build`
Expected: passes

**Step 3: Verify lint**

Run: `npm run lint`
Expected: 0 warnings

**Step 4: Commit**

```bash
git add src/Root.tsx
git commit -m "feat(settings): wire up SettingsModal and FAB toggle in Root"
```

---

### Task 4: Verify end-to-end and run tests

**Step 1: Run tests**

Run: `npm run test`
Expected: 33/33 pass

**Step 2: Run lint**

Run: `npm run lint`
Expected: 0 warnings

**Step 3: Run build**

Run: `npm run build`
Expected: passes

**Step 4: Visual check**

Run: `npm run dev`

Verify:
- Gear icon visible in mobile header (right side)
- Gear icon visible in desktop sidebar branding row (right of app name)
- Clicking gear opens Settings modal (centered on desktop, full-screen on mobile)
- "Theme Studio (Beta)" section with Open button and FAB toggle
- Clicking "Open Theme Studio" closes Settings, opens Theme Lab
- Enabling "Show floating button" toggle shows FAB on main app
- FAB opens Theme Lab directly
- Changelog section shows only the 3 most recent entries
- Latest changelog entry is always visible; two older entries are folded behind expand/collapse
- "Replay Tour" button is disabled with "(Coming soon)" text
- Escape key and backdrop click close the modal
- Focus stays trapped inside the modal

**Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix(settings): visual/functional adjustments from review"
```

(Skip this commit if no fixes needed.)

---

### Task 5: Update CLAUDE.md and docs

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update source structure**

Add `SettingsModal.tsx` to the source structure section in CLAUDE.md:

```
  SettingsModal.tsx     # settings modal (gear icon trigger, Theme Lab launch, changelog, stubs)
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add SettingsModal to CLAUDE.md source structure"
```

---

## Summary of Changes

| File | Action |
|------|--------|
| `src/SettingsModal.tsx` | Create — modal with Theme Studio, changelog, tour stub |
| `src/Root.tsx` | Rewrite — add settings state, FAB toggle, remove keyboard shortcut |
| `src/App.tsx` | Modify — add gear icon to mobile header + desktop sidebar, accept `onOpenSettings` prop |
| `src/types.ts` | Modify — add `onOpenSettings` to `SettingsPanelProps` |
| `CLAUDE.md` | Modify — add SettingsModal to source structure |
