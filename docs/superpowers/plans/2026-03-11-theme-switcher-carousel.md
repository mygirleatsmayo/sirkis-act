# Theme Switcher Carousel Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an accordion-style theme switcher carousel in the Settings Modal with one expanded card, 2-3 folded cards, and arrow navigation.

**Architecture:** Rewrite `ThemeSwitcherSection` in SettingsModal.tsx to use `motion` (formerly framer-motion) layout animations. Each theme card renders as a `motion.div` that transitions between expanded (175px) and folded (52px) widths. A `CarouselTheme` interface normalizes real themes and mock placeholders into a common shape.

**Tech Stack:** React 19, TypeScript, motion (v12.x), Tailwind CSS, Lucide icons

---

## File Structure

| File | Role |
| --- | --- |
| `src/SettingsModal.tsx` | Rewrite ThemeSwitcherSection; add CarouselTheme type, mock themes, FoldedCardContent, ArrowButton, toCarouselTheme helper |
| `package.json` | Add `motion` dependency |

No new files. All carousel code lives in SettingsModal.tsx alongside the existing ThemeCardChart and ChangelogSection.

---

## Chunk 1: Foundation

### Task 1: Install motion dependency

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install motion**

```bash
npm install motion
```

- [ ] **Step 2: Verify install**

```bash
npm ls motion
```

Expected: `motion@12.x.x` listed

- [ ] **Step 3: Verify build still works**

```bash
npm run build
```

Expected: Clean build, no errors

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add motion dependency for theme switcher carousel"
```

---

### Task 2: Add CarouselTheme type and toCarouselTheme helper

**Files:**

- Modify: `src/SettingsModal.tsx:1-16`

- [ ] **Step 1: Add the CarouselTheme interface and helpers**

At the top of SettingsModal.tsx, after the existing imports, add:

```typescript
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
// (ChevronDown already imported)
```

Then below `APP_VERSION` (line 16), add:

```typescript
/** Normalized shape for carousel cards — real themes and mock placeholders */
interface CarouselTheme {
  id: string;
  name: string;
  isMock: boolean;
  colors: {
    bg: string;
    bgGlass: string;
    brand: string;
    returns: string;
    loss: string;
    opm: string;
    textNeutral: string;
    textPrimary: string;
    textSecondary: string;
  };
  branding: {
    logo: LogoComponent;
    logoColor: string;
    heroLine1Color: string;
    heroLine2Color: string;
    cardFlavor?: string;
  };
  fonts: ThemeFonts;
}

const toCarouselTheme = (t: ThemeConfig): CarouselTheme => ({
  id: t.id,
  name: t.name,
  isMock: false,
  colors: {
    bg: t.colors.bg,
    bgGlass: t.colors.bgGlass,
    brand: t.colors.brand,
    returns: t.colors.returns,
    loss: t.colors.loss,
    opm: t.colors.opm,
    textNeutral: t.colors.textNeutral,
    textPrimary: t.colors.textPrimary,
    textSecondary: t.colors.textSecondary,
  },
  branding: {
    logo: t.branding.logo,
    logoColor: t.branding.logoColor,
    heroLine1Color: t.branding.heroLine1Color,
    heroLine2Color: t.branding.heroLine2Color,
    cardFlavor: t.branding.cardFlavor,
  },
  fonts: t.fonts,
});
```

Also add the necessary type imports at the top:

```typescript
import type { LogoComponent, ThemeConfig, ThemeFonts } from './themes/types';
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Clean build. The new types/helpers are defined but not yet consumed.

- [ ] **Step 3: Commit**

```bash
git add src/SettingsModal.tsx
git commit -m "feat: add CarouselTheme type and toCarouselTheme helper"
```

---

### Task 3: Add mock placeholder themes

**Files:**

- Modify: `src/SettingsModal.tsx` (below the `toCarouselTheme` helper)

- [ ] **Step 1: Create placeholder logo components and mock themes**

Add below `toCarouselTheme`:

```typescript
/** Placeholder SVG logos for mock themes */
const PlaceholderCatLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
    <circle cx="20" cy="22" r="14" stroke="currentColor" strokeWidth="2" />
    <polygon points="10,12 14,4 18,12" fill="currentColor" />
    <polygon points="22,12 26,4 30,12" fill="currentColor" />
    <circle cx="15" cy="20" r="1.5" fill="currentColor" />
    <circle cx="25" cy="20" r="1.5" fill="currentColor" />
    <path d="M16 26 Q20 30 24 26" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

const PlaceholderRootLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
    <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2" />
    <path d="M20 10 C20 10 16 18 16 24 C16 28 20 30 20 30 C20 30 24 28 24 24 C24 18 20 10 20 10Z" fill="currentColor" fillOpacity="0.6" />
    <path d="M16 24 C14 26 12 28 10 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M24 24 C26 26 28 28 30 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PlaceholderEinsteinLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
    <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2" />
    <text x="20" y="24" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="bold" fontFamily="serif">E=mc</text>
  </svg>
);

const MOCK_THEMES: CarouselTheme[] = [
  {
    id: 'mock-feral-filly',
    name: 'Feral Filly',
    isMock: true,
    colors: {
      bg: '#1E1E2E',
      bgGlass: '#2A2A3E',
      brand: '#CBA6F7',
      returns: '#F5C2E7',
      loss: '#F38BA8',
      opm: '#94E2D5',
      textNeutral: '#BAC2DE',
      textPrimary: '#CDD6F4',
      textSecondary: '#A6ADC8',
    },
    branding: {
      logo: PlaceholderCatLogo,
      logoColor: '#CBA6F7',
      heroLine1Color: '#CBA6F7',
      heroLine2Color: '#F5C2E7',
      cardFlavor: 'Pheline Financial',
    },
    fonts: { display: 'Fraunces, Georgia, serif', sans: 'Recursive, system-ui, sans-serif', mono: 'ui-monospace, monospace' },
  },
  {
    id: 'mock-overheated-rhizome',
    name: 'Overheated Rhizome',
    isMock: true,
    colors: {
      bg: '#1A1008',
      bgGlass: '#2C1E10',
      brand: '#D4840A',
      returns: '#E6A830',
      loss: '#C04040',
      opm: '#8B6914',
      textNeutral: '#C8A878',
      textPrimary: '#E8D4B0',
      textSecondary: '#A89070',
    },
    branding: {
      logo: PlaceholderRootLogo,
      logoColor: '#D4840A',
      heroLine1Color: '#E6A830',
      heroLine2Color: '#D4840A',
      cardFlavor: 'Financial Diss...ertation',
    },
    fonts: { display: 'Fraunces, Georgia, serif', sans: 'Recursive, system-ui, sans-serif', mono: 'ui-monospace, monospace' },
  },
  {
    id: 'mock-eighth-wonder',
    name: 'Eighth Wonder',
    isMock: true,
    colors: {
      bg: '#0A1628',
      bgGlass: '#142240',
      brand: '#3B82F6',
      returns: '#D4AF37',
      loss: '#DC2626',
      opm: '#60A5FA',
      textNeutral: '#94A3B8',
      textPrimary: '#E2E8F0',
      textSecondary: '#94A3B8',
    },
    branding: {
      logo: PlaceholderEinsteinLogo,
      logoColor: '#D4AF37',
      heroLine1Color: '#3B82F6',
      heroLine2Color: '#D4AF37',
      cardFlavor: 'Relativity Easy',
    },
    fonts: { display: 'Fraunces, Georgia, serif', sans: 'Recursive, system-ui, sans-serif', mono: 'ui-monospace, monospace' },
  },
];
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Clean build. Mocks defined but not yet consumed.

- [ ] **Step 3: Commit**

```bash
git add src/SettingsModal.tsx
git commit -m "feat: add mock placeholder themes for carousel prototyping"
```

---

## Chunk 2: Carousel Components

### Task 4: Build FoldedCardContent component

**Files:**

- Modify: `src/SettingsModal.tsx` (add component above ThemeSwitcherSection)

- [ ] **Step 1: Add FoldedCardContent**

Place above the existing `ThemeSwitcherSection`:

```typescript
const SIDE_PANEL_WIDTH = 52;
const CARD_HEIGHT = 180;

const FoldedCardContent = ({ theme: t }: { theme: CarouselTheme }) => {
  const Logo = t.branding.logo;
  const spaceIdx = t.name.indexOf(' ');
  const initial1 = t.name[0] ?? '';
  const initial2 = spaceIdx > 0 ? t.name[spaceIdx + 1] ?? '' : '';

  return (
    <div className="flex flex-col h-full">
      {/* Logo zone — bgGlass */}
      <div
        className="flex items-center justify-center py-2 shrink-0"
        style={{ backgroundColor: t.colors.bgGlass }}
      >
        <div style={{ color: t.branding.logoColor }}>
          <Logo className="h-[24px] w-auto" />
        </div>
      </div>
      {/* Initials + swatches — bg */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1.5">
        <div
          className="font-display font-bold text-[18px] leading-none"
          style={{ color: t.branding.heroLine1Color }}
        >
          {initial1}
        </div>
        {initial2 && (
          <div
            className="font-display font-bold text-[18px] leading-none"
            style={{ color: t.branding.heroLine2Color }}
          >
            {initial2}
          </div>
        )}
        <div className="flex flex-col gap-[5px] mt-1">
          {CIRCLE_KEYS.map((key) => (
            <div
              key={key}
              className="w-[12px] h-[12px] rounded-full mx-auto"
              style={{
                backgroundColor: t.colors[key],
                boxShadow: '0 0 0 1px rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Clean build. Component defined but not yet rendered.

- [ ] **Step 3: Commit**

```bash
git add src/SettingsModal.tsx
git commit -m "feat: add FoldedCardContent component for collapsed theme cards"
```

---

### Task 5: Build ExpandedCardContent component

**Files:**

- Modify: `src/SettingsModal.tsx` (add component below FoldedCardContent)

- [ ] **Step 1: Extract ExpandedCardContent from existing ThemeSwitcherSection card**

This extracts the existing card internals into a standalone component. Place below FoldedCardContent:

```typescript
const ExpandedCardContent = ({ theme: t }: { theme: CarouselTheme }) => {
  const Logo = t.branding.logo;
  const spaceIdx = t.name.indexOf(' ');
  const nameLine1 = spaceIdx > 0 ? t.name.slice(0, spaceIdx) : t.name;
  const nameLine2 = spaceIdx > 0 ? t.name.slice(spaceIdx + 1) : '';

  return (
    <div className="flex h-full">
      {/* Glass side panel — fixed width */}
      <div
        className="flex flex-col items-center pt-2.5 pb-2.5 shrink-0"
        style={{ width: SIDE_PANEL_WIDTH, backgroundColor: t.colors.bgGlass }}
      >
        <div style={{ color: t.branding.logoColor }}>
          <Logo className="h-[36px] w-auto" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col gap-[7px]">
            {CIRCLE_KEYS.map((key) => (
              <div
                key={key}
                className="w-[16px] h-[16px] rounded-full"
                style={{
                  backgroundColor: t.colors[key],
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col p-2.5 min-w-0">
        <div>
          <div
            className="font-display font-bold text-[16px] leading-none"
            style={{ color: t.branding.heroLine1Color }}
          >
            {nameLine1}
          </div>
          {nameLine2 && (
            <div
              className="font-display font-bold text-[16px] leading-none mt-[4px]"
              style={{ color: t.branding.heroLine2Color }}
            >
              {nameLine2}
            </div>
          )}
        </div>

        {t.branding.cardFlavor && (
          <div
            className="text-[10px] font-sans leading-none mt-[10px]"
            style={{ color: t.colors.textSecondary }}
          >
            {t.branding.cardFlavor}
          </div>
        )}

        <div
          className="flex-1 flex items-center px-2 mt-2 rounded-lg min-h-[40px]"
          style={{ backgroundColor: t.colors.bgGlass }}
        >
          <ThemeCardChart colors={t.colors} />
        </div>

        <div
          className="text-[12px] font-bold text-center mt-1.5"
          style={{
            color: t.colors.textPrimary,
            fontFamily: t.fonts.mono,
            fontFeatureSettings: '"tnum"',
          }}
        >
          $1,618,033
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add src/SettingsModal.tsx
git commit -m "feat: add ExpandedCardContent component for theme carousel"
```

---

### Task 6: Build ArrowButton component

**Files:**

- Modify: `src/SettingsModal.tsx` (add component below ExpandedCardContent)

- [ ] **Step 1: Add ArrowButton**

```typescript
const ArrowButton = ({
  direction,
  onClick,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={direction === 'left' ? 'Previous theme' : 'Next theme'}
    className="shrink-0 flex items-center justify-center rounded-lg border border-white/10 hover:border-white/25 hover:bg-white/5 transition-colors"
    style={{ width: 28, height: CARD_HEIGHT }}
  >
    {direction === 'left' ? (
      <ChevronLeft size={14} className="text-content-subtle" />
    ) : (
      <ChevronRight size={14} className="text-content-subtle" />
    )}
  </button>
);
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add src/SettingsModal.tsx
git commit -m "feat: add ArrowButton component for carousel navigation"
```

---

## Chunk 3: Carousel Assembly

### Task 7: Rewrite ThemeSwitcherSection with carousel logic

**Files:**

- Modify: `src/SettingsModal.tsx:84-216` (replace entire ThemeSwitcherSection)

This is the core task. Replace the existing `ThemeSwitcherSection` with the carousel version.

- [ ] **Step 0: Update React import**

The existing import (line 1) needs `useMemo` added:

```typescript
import { useState, useEffect, useRef, useMemo } from 'react';
```

- [ ] **Step 1: Replace ThemeSwitcherSection**

Delete lines 84-216 (the existing `ThemeSwitcherSection`) and replace with:

```typescript
const EXPANDED_WIDTH = 175;
const FOLDED_COUNT_MOBILE = 2;
const FOLDED_COUNT_DESKTOP = 3;

const ThemeSwitcherSection = ({
  onCloseThemeLab,
}: {
  onCloseThemeLab: () => void;
}) => {
  const { theme: activeTheme, themeId, setThemeId } = useTheme();
  const selectableThemes = getSelectableThemes();

  // Build carousel items: real themes first, then mocks
  const carouselThemes: CarouselTheme[] = [
    ...selectableThemes.map(toCarouselTheme),
    ...MOCK_THEMES,
  ];

  const [expandedId, setExpandedId] = useState(themeId);

  // Responsive: 2 folded on mobile, 3 on desktop
  const [foldedCount, setFoldedCount] = useState(FOLDED_COUNT_MOBILE);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const update = () => setFoldedCount(mq.matches ? FOLDED_COUNT_DESKTOP : FOLDED_COUNT_MOBILE);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const windowSize = 1 + foldedCount;
  const maxStart = Math.max(0, carouselThemes.length - windowSize);
  const [startIndex, setStartIndex] = useState(() => {
    // Start with the active theme visible
    const activeIdx = carouselThemes.findIndex((t) => t.id === themeId);
    return Math.min(Math.max(0, activeIdx), maxStart);
  });

  const advance = (delta: number) => {
    setStartIndex((prev) => {
      const next = prev + delta;
      if (next < 0) return maxStart;
      if (next > maxStart) return 0;
      return next;
    });
  };

  // Memoize visible themes to avoid re-creating array on every render
  const visibleThemes = useMemo(() =>
    carouselThemes.slice(startIndex, startIndex + windowSize),
    [startIndex, windowSize, carouselThemes.length]
  );

  const handleCardClick = (id: string) => {
    if (id === expandedId) return;
    setExpandedId(id);

    // Activate real themes on click
    const theme = carouselThemes.find((t) => t.id === id);
    if (theme && !theme.isMock && id !== themeId) {
      onCloseThemeLab();
      setThemeId(id);
    }
  };

  // If expanded card scrolls out of view, auto-expand first visible
  useEffect(() => {
    const isVisible = visibleThemes.some((t) => t.id === expandedId);
    if (!isVisible && visibleThemes.length > 0) {
      setExpandedId(visibleThemes[0].id);
    }
  }, [startIndex, expandedId, visibleThemes]);

  const springTransition = { type: 'spring' as const, stiffness: 400, damping: 40 };

  return (
    <section>
      <h3 className="text-[11px] font-black uppercase tracking-widest text-content-secondary mb-3">
        Theme
      </h3>
      <div
        className="flex items-stretch gap-1.5"
        role="group"
        aria-label="Theme switcher"
      >
        <ArrowButton direction="left" onClick={() => advance(-1)} />

        <div className="flex gap-1.5 min-w-0">
          {visibleThemes.map((t) => {
            const isExpanded = t.id === expandedId;
            const isActive = t.id === themeId;

            return (
              <motion.div
                key={t.id}
                layout
                transition={springTransition}
                onClick={() => handleCardClick(t.id)}
                className={`relative rounded-xl border-2 cursor-pointer shrink-0 ${
                  isActive ? '' : 'border-white/10 hover:border-white/25'
                }`}
                style={{
                  width: isExpanded ? EXPANDED_WIDTH : SIDE_PANEL_WIDTH,
                  height: CARD_HEIGHT,
                  backgroundColor: t.colors.bg,
                  borderColor: isActive ? activeTheme.colors.brand : undefined,
                  boxShadow: isActive ? `0 0 0 2px ${activeTheme.colors.brand}` : undefined,
                }}
                role="button"
                tabIndex={0}
                aria-label={
                  t.isMock
                    ? `${t.name} theme (coming soon)`
                    : `Switch to ${t.name} theme`
                }
                aria-pressed={isActive}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(t.id);
                  }
                  // Arrow key navigation between visible cards
                  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const idx = visibleThemes.findIndex((vt) => vt.id === t.id);
                    const nextIdx = e.key === 'ArrowRight' ? idx + 1 : idx - 1;
                    if (nextIdx >= 0 && nextIdx < visibleThemes.length) {
                      const container = e.currentTarget.parentElement;
                      const cards = container?.querySelectorAll<HTMLElement>('[role="button"]');
                      cards?.[nextIdx]?.focus();
                    }
                  }
                }}
              >
                {/* Inner wrapper — overflow-hidden here, not on outer motion.div, to preserve border/shadow */}
                <div className="rounded-xl overflow-hidden h-full">
                  <AnimatePresence mode="wait">
                    {isExpanded ? (
                      <motion.div
                        key={`expanded-${t.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="h-full"
                      >
                        <ExpandedCardContent theme={t} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`folded-${t.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="h-full"
                      >
                        <FoldedCardContent theme={t} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mock badge */}
                {t.isMock && (
                  <div className="absolute inset-0 flex items-end justify-center pb-1.5 rounded-xl pointer-events-none">
                    <span
                      className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-black/60 text-white/60"
                    >
                      Soon
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <ArrowButton direction="right" onClick={() => advance(1)} />
      </div>
    </section>
  );
};
```

- [ ] **Step 2: Remove unused imports if any**

Check that `resolveTheme` import is still needed (used by the removed old ThemeSwitcherSection). If only used there, remove it from the import line:

```typescript
// Before:
import { getSelectableThemes, resolveTheme } from './themes/index';
// After (if resolveTheme is no longer used):
import { getSelectableThemes } from './themes/index';
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Clean build.

- [ ] **Step 4: Verify lint**

```bash
npm run lint
```

Expected: Zero warnings.

- [ ] **Step 5: Visual check**

Open the dev server (`npm run dev`), open Settings modal, verify:
- Cyprus card is expanded by default
- 3 mock cards appear folded
- Clicking a folded card expands it with animation
- Arrow buttons cycle through themes
- Active theme has brand border/glow

- [ ] **Step 6: Commit**

```bash
git add src/SettingsModal.tsx
git commit -m "feat: implement theme switcher carousel with accordion animation"
```

---

### Task 8: Run existing tests

**Files:**

- None modified; verification only

- [ ] **Step 1: Run full test suite**

```bash
npm run test
```

Expected: All 131 tests pass. The carousel is a UI component with no business logic tests to break, but verify nothing regressed.

- [ ] **Step 2: Run full build pipeline**

```bash
npm run build && npm run lint
```

Expected: Clean build, zero lint warnings.

---

## Chunk 4: Polish and Responsive Tuning

### Task 9: Test responsive behavior

**Files:**

- Modify: `src/SettingsModal.tsx` (if adjustments needed)

- [ ] **Step 1: Test mobile viewport (< 640px)**

Open dev tools, resize to 375px width. Verify:
- 1 expanded + 2 folded cards visible
- Arrow buttons visible and functional
- Carousel fits within modal without horizontal overflow
- Cards don't overlap or clip

- [ ] **Step 2: Test desktop viewport (>= 640px)**

Resize to 768px+ width. Verify:
- 1 expanded + 3 folded cards visible
- Arrow buttons visible and functional

- [ ] **Step 3: Test narrow viewport (320px)**

Resize to 320px (iPhone SE). Verify:
- Carousel scales down or remains usable
- No horizontal overflow or broken layout

- [ ] **Step 4: Adjust sizes if needed**

If cards overflow on narrow viewports, adjust `EXPANDED_WIDTH`, `SIDE_PANEL_WIDTH`, or gap values. These are constants at the top of the component, easy to tune.

- [ ] **Step 5: Commit any adjustments**

```bash
git add src/SettingsModal.tsx
git commit -m "fix: tune carousel sizing for narrow viewports"
```

(Skip this step if no adjustments were needed.)

---

### Task 10: Final verification and cleanup

- [ ] **Step 1: Full build pipeline**

```bash
npm run build && npm run lint && npm run test
```

Expected: All clean.

- [ ] **Step 2: Visual smoke test**

- Open Settings modal on desktop
- Click through all theme cards (expand/fold transitions)
- Click arrows to cycle past visible window
- Verify wrap-around works (right arrow at end goes to start)
- Verify active theme indicator (brand border) stays on Cyprus regardless of which card is expanded
- Verify mock cards show "Soon" badge
- Close and reopen Settings — expanded card should default to active theme

- [ ] **Step 3: Commit if any final cleanup**

```bash
git add -A
git commit -m "chore: theme switcher carousel polish and cleanup"
```
