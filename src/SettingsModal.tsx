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
    modalRef.current?.focus();

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOpenThemeLab = () => {
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
