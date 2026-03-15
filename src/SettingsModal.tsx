import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Palette, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from './themes/useTheme';
import { CHANGELOG_ENTRIES } from './changelog';
import { getSelectableThemes } from './themes/index';
import type { LogoComponent, ThemeColors, ThemeConfig, ThemeFonts } from './themes/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenThemeLab: () => void;
  onCloseThemeLab: () => void;
  showFab: boolean;
  onToggleFab: (value: boolean) => void;
}

const APP_VERSION = CHANGELOG_ENTRIES[0]?.version ?? '0.0.0';

/** Normalized shape for carousel cards — real themes and mock placeholders */
interface CarouselTheme {
  id: string;
  name: string;
  nameLine1: string;
  nameLine2: string;
  isMock: boolean;
  colors: Pick<ThemeColors, 'bg' | 'bgGlass' | 'brand' | 'returns' | 'loss' | 'opm' | 'textNeutral' | 'textPrimary' | 'textSecondary'>;
  branding: {
    logo: LogoComponent;
    logoColor: string;
    heroLine1Color: string;
    heroLine2Color: string;
    cardFlavor?: string;
  };
  fonts: ThemeFonts;
}

const splitName = (name: string) => {
  const i = name.indexOf(' ');
  return { nameLine1: i > 0 ? name.slice(0, i) : name, nameLine2: i > 0 ? name.slice(i + 1) : '' };
};

const toCarouselTheme = (t: ThemeConfig): CarouselTheme => ({
  id: t.id,
  name: t.name,
  ...splitName(t.name),
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
    ...splitName('Feral Filly'),
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
    ...splitName('Overheated Rhizome'),
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
    ...splitName('Eighth Wonder'),
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

const CIRCLE_KEYS = ['returns', 'loss', 'opm', 'textNeutral'] as const;

/** Mini chart: three projection curves fanning from a shared bottom-left origin */
const ThemeCardChart = ({ colors }: { colors: { returns: string; brand: string; opm: string } }) => (
  <svg viewBox="0 0 100 56" className="w-full h-auto" aria-hidden="true">
    <path d="M2 54 C28 48 58 28 98 6 L98 54 Z" fill={colors.returns} fillOpacity={0.07} />
    <path d="M2 54 C28 48 58 28 98 6"  stroke={colors.returns} fill="none" strokeWidth="2" strokeLinecap="round" />
    <path d="M2 54 C28 50 58 38 98 22" stroke={colors.brand}   fill="none" strokeWidth="2" strokeLinecap="round" />
    <path d="M2 54 C28 52 58 46 98 36" stroke={colors.opm}     fill="none" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SIDE_PANEL_WIDTH = 48;
const CARD_HEIGHT = 180;

const FoldedCardContent = ({ theme: t }: { theme: CarouselTheme }) => {
  const Logo = t.branding.logo;
  const initial1 = t.nameLine1[0] ?? '';
  const initial2 = t.nameLine2[0] ?? '';

  return (
    <motion.div layout="position" className="flex flex-col h-full">
      {/* Logo zone — bgGlass */}
      <motion.div
        layout="position"
        className="flex items-center justify-center py-2 shrink-0"
        style={{ backgroundColor: t.colors.bgGlass }}
      >
        <motion.div layout="position" style={{ color: t.branding.logoColor }}>
          <Logo className="h-[24px] w-auto" />
        </motion.div>
      </motion.div>
      {/* Initials + swatches — bg */}
      <motion.div layout="position" className="flex-1 flex flex-col items-center justify-center gap-1.5">
        <motion.div
          layout="position"
          className="font-display font-bold text-[18px] leading-none"
          style={{ color: t.branding.heroLine1Color }}
        >
          {initial1}
        </motion.div>
        {initial2 && (
          <motion.div
            layout="position"
            className="font-display font-bold text-[18px] leading-none"
            style={{ color: t.branding.heroLine2Color }}
          >
            {initial2}
          </motion.div>
        )}
        <motion.div layout="position" className="flex flex-col gap-[5px] mt-1">
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
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const ExpandedCardContent = ({ theme: t }: { theme: CarouselTheme }) => {
  const Logo = t.branding.logo;

  return (
    <motion.div layout="position" className="flex h-full">
      {/* Glass side panel — fixed width */}
      <motion.div
        layout="position"
        className="flex flex-col items-center pt-2.5 pb-2.5 shrink-0"
        style={{ width: SIDE_PANEL_WIDTH, backgroundColor: t.colors.bgGlass }}
      >
        <motion.div layout="position" style={{ color: t.branding.logoColor }}>
          <Logo className="h-[36px] w-auto" />
        </motion.div>
        <motion.div layout="position" className="flex-1 flex items-center justify-center">
          <motion.div layout="position" className="flex flex-col gap-[7px]">
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
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Content area */}
      <motion.div layout="position" className="flex-1 flex flex-col p-2.5 min-w-0">
        <motion.div layout="position">
          <motion.div
            layout="position"
            className="font-display font-bold text-[16px] leading-none"
            style={{ color: t.branding.heroLine1Color }}
          >
            {t.nameLine1}
          </motion.div>
          {t.nameLine2 && (
            <motion.div
              layout="position"
              className="font-display font-bold text-[16px] leading-none mt-[4px]"
              style={{ color: t.branding.heroLine2Color }}
            >
              {t.nameLine2}
            </motion.div>
          )}
        </motion.div>

        {t.branding.cardFlavor && (
          <motion.div
            layout="position"
            className="text-[10px] font-sans leading-none mt-[10px]"
            style={{ color: t.colors.textSecondary }}
          >
            {t.branding.cardFlavor}
          </motion.div>
        )}

        <motion.div
          layout="position"
          className="flex-1 flex items-center px-2 mt-2 rounded-lg min-h-[40px]"
          style={{ backgroundColor: t.colors.bgGlass }}
        >
          <ThemeCardChart colors={t.colors} />
        </motion.div>

        <motion.div
          layout="position"
          className="text-[12px] font-bold text-center mt-1.5"
          style={{
            color: t.colors.textPrimary,
            fontFamily: t.fonts.mono,
            fontFeatureSettings: '"tnum"',
          }}
        >
          $1,618,033
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const ArrowButton = ({
  direction,
  onClick,
  disabled,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={direction === 'left' ? 'Previous theme' : 'Next theme'}
    className={`shrink-0 flex items-center justify-center rounded-lg border transition-colors ${
      disabled
        ? 'border-white/5 opacity-30 cursor-default'
        : 'border-white/10 hover:border-white/25 hover:bg-white/5'
    }`}
    style={{ width: 28, height: CARD_HEIGHT }}
  >
    {direction === 'left' ? (
      <ChevronLeft size={14} className="text-content-subtle" />
    ) : (
      <ChevronRight size={14} className="text-content-subtle" />
    )}
  </button>
);

const EXPANDED_WIDTH = 175;
const CAROUSEL_GAP = 4; // gap-1
const SPRING_TRANSITION = { type: 'spring' as const, stiffness: 400, damping: 40 };

const ThemeSwitcherSection = ({
  onCloseThemeLab,
}: {
  onCloseThemeLab: () => void;
}) => {
  const { theme: activeTheme, themeId, setThemeId } = useTheme();
  const selectableThemes = getSelectableThemes();

  // Build carousel items: real themes first, then mocks
  // getSelectableThemes() allocates a new array each call; memoize by length
  const carouselThemes = useMemo<CarouselTheme[]>(
    () => [...selectableThemes.map(toCarouselTheme), ...MOCK_THEMES],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectableThemes.length],
  );

  const [expandedId, setExpandedId] = useState(themeId);

  // Measure cards container and compute optimal layout
  const cardsRef = useRef<HTMLDivElement>(null);
  const [cardsWidth, setCardsWidth] = useState(0);
  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setCardsWidth(Math.floor(entry.contentBoxSize[0].inlineSize));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Layout: expanded cards flex-grow to fill remaining space (capped at EXPANDED_WIDTH).
  // Start with max folded cards that fit, then shed folded until expanded cards get MIN_EXPANDED.
  const { windowSize, expandedCount } = useMemo(() => {
    if (cardsWidth === 0) return { windowSize: 3, expandedCount: 1 };

    const F = SIDE_PANEL_WIDTH, G = CAROUSEL_GAP;
    const MIN_EXP = 160; // side panel (48) + usable content area

    // How many folded cards fit if all were folded?
    const maxSlots = Math.min(
      Math.max(2, Math.floor((cardsWidth + G) / (F + G))),
      carouselThemes.length,
    );

    // Try total = maxSlots down to 2: always 1 expanded, rest folded.
    // Accept the first total where expanded card gets at least MIN_EXP.
    for (let total = maxSlots; total >= 2; total--) {
      const folded = total - 1;
      const expandedWidth = cardsWidth - folded * F - (total - 1) * G;
      if (expandedWidth >= MIN_EXP) return { windowSize: total, expandedCount: 1 };
    }
    return { windowSize: 2, expandedCount: 1 };
  }, [cardsWidth, carouselThemes.length]);

  const maxStart = Math.max(0, carouselThemes.length - windowSize);
  const [startIndex, setStartIndex] = useState(() => {
    // Start with the active theme visible
    const activeIdx = carouselThemes.findIndex((t) => t.id === themeId);
    return Math.min(Math.max(0, activeIdx), maxStart);
  });

  const advance = (delta: number) => {
    setStartIndex((prev) => Math.max(0, Math.min(prev + delta, maxStart)));
  };

  const atStart = startIndex === 0;
  const atEnd = startIndex >= maxStart;

  // Memoize visible themes to avoid re-creating array on every render
  const visibleThemes = useMemo(
    () => carouselThemes.slice(startIndex, startIndex + windowSize),
    [carouselThemes, startIndex, windowSize],
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

  // Clamp startIndex when maxStart shrinks (e.g., after resize)
  useEffect(() => {
    setStartIndex((prev) => Math.min(prev, maxStart));
  }, [maxStart]);

  // If expanded card scrolls out of view, auto-expand first visible
  useEffect(() => {
    const isVisible = visibleThemes.some((t) => t.id === expandedId);
    if (!isVisible && visibleThemes.length > 0) {
      setExpandedId(visibleThemes[0].id);
    }
  }, [startIndex, expandedId, visibleThemes]);

  // Which slots are expanded — computed once, not per card
  const selectedIdx = visibleThemes.findIndex((vt) => vt.id === expandedId);
  const expandStart = Math.max(0, Math.min(selectedIdx, visibleThemes.length - expandedCount));

  return (
    <section>
      <h3 className="text-[11px] font-black uppercase tracking-widest text-content-secondary mb-3">
        Theme
      </h3>
      <div
        className="flex items-stretch gap-1"
        role="group"
        aria-label="Theme switcher"
      >
        <ArrowButton direction="left" onClick={() => advance(-1)} disabled={atStart} />

        <div ref={cardsRef} className="flex-1 flex gap-1 min-w-0 overflow-hidden">
          {visibleThemes.map((t, idx) => {
            const isExpanded = idx >= expandStart && idx < expandStart + expandedCount;
            const isActive = t.id === themeId;

            return (
              <motion.div
                key={t.id}
                layout
                transition={SPRING_TRANSITION}
                onClick={() => handleCardClick(t.id)}
                className="relative rounded-xl cursor-pointer"
                style={{
                  ...(isExpanded
                    ? { flex: '1 1 0%', maxWidth: EXPANDED_WIDTH, minWidth: SIDE_PANEL_WIDTH }
                    : { width: SIDE_PANEL_WIDTH, flexShrink: 0 }),
                  height: CARD_HEIGHT,
                  backgroundColor: t.colors.bg,
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
                {/* Inner wrapper — always-mounted layers with opacity crossfade.
                    Avoids mount/unmount during parent layout scale (which distorts children). */}
                <motion.div layout className="relative rounded-xl overflow-hidden h-full">
                  <motion.div
                    className="absolute inset-0"
                    animate={{ opacity: isExpanded ? 1 : 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ pointerEvents: isExpanded ? 'auto' : 'none' }}
                  >
                    <ExpandedCardContent theme={t} />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0"
                    animate={{ opacity: isExpanded ? 0 : 1 }}
                    transition={{ duration: 0.1 }}
                    style={{ pointerEvents: isExpanded ? 'none' : 'auto' }}
                  >
                    <FoldedCardContent theme={t} />
                  </motion.div>
                </motion.div>

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

                {/* Selection ring — overlay so child backgrounds can't cover it */}
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    boxShadow: isActive
                      ? `inset 0 0 0 2px ${activeTheme.colors.brand}`
                      : 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                  }}
                />
              </motion.div>
            );
          })}
        </div>

        <ArrowButton direction="right" onClick={() => advance(1)} disabled={atEnd} />
      </div>
    </section>
  );
};

const ChangelogSection = () => {
  const [expanded, setExpanded] = useState(false);
  const recent = CHANGELOG_ENTRIES.slice(0, 3);
  const [latest, ...older] = recent;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-content-secondary">
          Changelog
        </h3>
        <span className="text-[11px] font-bold text-content-subtle">
          v{APP_VERSION}
        </span>
      </div>
      <div className="space-y-4">
        {latest && <ChangelogEntryBlock entry={latest} />}
        {older.length > 0 && (
          <>
            {expanded && older.map((entry) => (
              <ChangelogEntryBlock key={entry.version} entry={entry} />
            ))}
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[11px] font-semibold text-content-subtle hover:text-content-secondary transition-colors"
            >
              <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
              {expanded ? 'Show less' : `${older.length} older release${older.length > 1 ? 's' : ''}`}
            </button>
          </>
        )}
      </div>
    </section>
  );
};

const ChangelogEntryBlock = ({ entry }: { entry: { version: string; date: string; title: string; items: string[] } }) => (
  <div>
    <div className="flex items-baseline gap-2 mb-1">
      <span className="text-xs font-bold text-content-secondary">v{entry.version}</span>
      <span className="text-[10px] text-content-subtle">{entry.date}</span>
    </div>
    <p className="text-xs font-semibold text-content-secondary mb-1">{entry.title}</p>
    <ul className="space-y-0.5">
      {entry.items.map((item, i) => (
        <li key={i} className="text-[11px] text-content-secondary pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-content-secondary">
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export const SettingsModal = ({
  isOpen,
  onClose,
  onOpenThemeLab,
  onCloseThemeLab,
  showFab,
  onToggleFab,
}: SettingsModalProps) => {
  const { theme } = useTheme();
  const isThemeLabLocked = theme.editor.kind === 'locked';
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap, Escape key, and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

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
    modalRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isThemeLabLocked && showFab) {
      onToggleFab(false);
    }
  }, [isThemeLabLocked, onToggleFab, showFab]);

  if (!isOpen) return null;

  // Close modal first, then open Theme Lab on the next frame so it
  // doesn't render behind the still-mounted modal backdrop.
  const handleOpenThemeLab = () => {
    if (isThemeLabLocked) return;
    onClose();
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
        className="absolute inset-0 bg-surface-overlay backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-lg mx-4 max-h-[85vh] flex flex-col bg-surface-glass border border-white/10 rounded-2xl shadow-2xl outline-none
          max-sm:fixed max-sm:inset-0 max-sm:max-w-none max-sm:mx-0 max-sm:max-h-none max-sm:rounded-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg font-display font-bold text-content-primary">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 rounded-lg text-content-subtle hover:text-content-primary hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-8">
          {/* Theme Switcher Section */}
          <ThemeSwitcherSection onCloseThemeLab={onCloseThemeLab} />

          {/* Theme Lab Section */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-content-secondary">
                Theme Lab
              </h3>
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: theme.colors.brand, color: theme.colors.textOnBrand }}
              >
                Beta
              </span>
            </div>
            <p className="text-sm text-content-secondary mb-4">
              Customize colors, fonts, and branding with{' '}
              <span className="whitespace-nowrap">a live preview.</span>
            </p>
            <button
              type="button"
              onClick={handleOpenThemeLab}
              disabled={isThemeLabLocked}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors"
              style={{ backgroundColor: theme.colors.brand, color: theme.colors.textOnBrand, opacity: isThemeLabLocked ? 0.45 : 1 }}
            >
              <Palette size={16} />
              Open Theme Lab
            </button>
            {isThemeLabLocked && (
              <p className="mt-2 text-[11px] text-amber-300/90">This theme is brand locked and cannot be edited in Theme Lab.</p>
            )}
            <label className={`flex items-center gap-3 mt-3 select-none ${isThemeLabLocked ? 'cursor-not-allowed opacity-65' : 'cursor-pointer'}`}>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showFab}
                  onChange={(e) => onToggleFab(e.target.checked)}
                  disabled={isThemeLabLocked}
                  className="sr-only peer"
                />
                <div className={`w-9 h-5 rounded-full transition-colors ${isThemeLabLocked ? 'bg-white/10' : 'bg-white/15 peer-checked:bg-accent-brand'}`} />
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full shadow-sm transition-transform peer-checked:translate-x-4 ${isThemeLabLocked ? 'bg-white/70' : 'bg-white'}`} />
              </div>
              <div>
                <span className="text-sm font-semibold text-content-secondary">
                  Show floating button
                </span>
                <span className="block text-[11px] text-content-subtle">
                  {isThemeLabLocked ? 'Unavailable for locked themes' : 'Quick access while editing'}
                </span>
              </div>
            </label>
          </section>

          {/* Changelog Section */}
          <ChangelogSection />

          {/* Welcome Tour Section (stub) */}
          <section className="flex flex-col items-center">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-content-subtle mb-2 self-start">
              Welcome Tour
            </h3>
            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-xl text-sm font-bold text-content-subtle/50 bg-white/5 border border-white/5 cursor-not-allowed"
            >
              Replay Tour
            </button>
            <span className="text-[11px] text-content-subtle/50 mt-1">Coming soon</span>
          </section>
        </div>
      </div>
    </div>
  );
};
