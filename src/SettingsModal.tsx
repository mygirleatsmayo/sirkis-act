import { useState, useEffect, useRef } from 'react';
import { X, Palette, ChevronDown } from 'lucide-react';
import { useTheme } from './themes/useTheme';
import { CHANGELOG_ENTRIES } from './changelog';
import { getSelectableThemes, resolveTheme } from './themes/index';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenThemeLab: () => void;
  onCloseThemeLab: () => void;
  showFab: boolean;
  onToggleFab: (value: boolean) => void;
}

const APP_VERSION = CHANGELOG_ENTRIES[0]?.version ?? '0.0.0';

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
          const resolved = resolveTheme(t);
          const Logo = t.branding.logo;
          const logoColor =
            resolved.capabilities.logoColorMode === 'intrinsic'
              ? undefined
              : t.branding.logoColor;
          const spaceIdx = t.name.indexOf(' ');
          const nameLine1 = spaceIdx > 0 ? t.name.slice(0, spaceIdx) : t.name;
          const nameLine2 = spaceIdx > 0 ? t.name.slice(spaceIdx + 1) : '';

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelect(t.id)}
              className={`relative w-[200px] h-[180px] rounded-xl border-2 transition-all overflow-hidden text-left ${
                isActive ? '' : 'border-white/10 hover:border-white/25'
              }`}
              style={{
                backgroundColor: t.colors.bg,
                borderColor: isActive ? activeTheme.colors.brand : undefined,
                boxShadow: isActive ? `0 0 0 2px ${activeTheme.colors.brand}` : undefined,
              }}
              aria-label={`Switch to ${t.name} theme`}
              aria-pressed={isActive}
            >
              <div className="flex h-full">
                {/* Glass side panel ~33% */}
                <div
                  className="flex flex-col items-center pt-2.5 pb-2.5 shrink-0"
                  style={{ width: '33%', backgroundColor: t.colors.bgGlass }}
                >
                  {/* Logo — h-[36px] w-auto: correct aspect ratio, height matches two-line name block */}
                  <div style={{ color: logoColor }}>
                    <Logo className="h-[36px] w-auto" />
                  </div>
                  {/* Circles — centered in space between logo bottom and card bottom */}
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

                {/* Main content ~67% */}
                <div className="flex-1 flex flex-col p-2.5 min-w-0">
                  {/* Theme name — two lines, display font, left justified */}
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

                  {/* Flavor text */}
                  {t.branding.cardFlavor && (
                    <div
                      className="text-[10px] font-sans leading-none mt-[10px]"
                      style={{ color: t.colors.textSecondary }}
                    >
                      {t.branding.cardFlavor}
                    </div>
                  )}

                  {/* Chart — on bgGlass surface, fills remaining vertical space */}
                  <div
                    className="flex-1 flex items-center px-2 mt-2 rounded-lg min-h-[40px]"
                    style={{ backgroundColor: t.colors.bgGlass }}
                  >
                    <ThemeCardChart colors={t.colors} />
                  </div>

                  {/* Dollar amount */}
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
            </button>
          );
        })}
      </div>
    </section>
  );
};

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
                // Intentional: Theme Lab is fully user-driven; no hardcoded contrast guardrails for brand surfaces.
                style={{ backgroundColor: theme.colors.brand, color: theme.colors.textPrimary }}
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
              // Intentional: contrast is controlled by theme token choices (brand/textPrimary), not forced logic.
              style={{ backgroundColor: theme.colors.brand, color: theme.colors.textPrimary, opacity: isThemeLabLocked ? 0.45 : 1 }}
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
