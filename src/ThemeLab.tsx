import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Lock, Unlock, RotateCcw, X, Upload, Palette, Download, Copy, ChevronDown, Sun, Moon, Zap, Info } from 'lucide-react';
import DOMPurify from 'dompurify';
import type { ThemeConfig, ThemeColors, LogoComponent } from './themes/types';
import { useTheme } from './themes/useTheme';
import { hexToRgb, parseRgba, toHex, relativeLuminance } from './utils/colorMath';
import type { Primaries, ThemeMode } from './themes/derivationRules';
import { applyLockedDerivations, isTokenLocked } from './themes/themeLabDerivation';

// ─── Helpers ──────────────────────────────────────────────────────────────

const camelToLabel = (s: string): string =>
  s.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim();

/** Convert a derived token path to a readable label for tooltips */
const pathToLabel = (path: string): string => {
  if (path.startsWith('colors.')) return camelToLabel(path.slice(7));
  if (path.startsWith('branding.')) return camelToLabel(path.slice(9));
  if (path.startsWith('effects.glowColors.')) return `Glow ${+path.slice(19) + 1}`;
  if (path.startsWith('effects.blobs.')) {
    const idx = +path.charAt(14);
    return `Blob ${idx + 1}`;
  }
  return path;
};

/** Sanitize SVG string via DOMPurify — strips scripts, event handlers, unsafe elements */
const sanitizeSvg = (raw: string): string =>
  DOMPurify.sanitize(raw, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['svg'],
    RETURN_DOM: false,
  }) as string;

/** Prepare a sanitized SVG string for inline rendering — inherit color and fill container */
const prepareSvgHtml = (svg: string): string =>
  svg
    .replace(/fill="[^"]*"/g, 'fill="currentColor"')
    .replace(/stroke="[^"]*"/g, 'stroke="currentColor"')
    .replace(/<svg/, '<svg style="width:100%;height:100%"');

/** Shallow-clone a ThemeConfig (preserves logo component ref) */
const cloneTheme = (t: ThemeConfig): ThemeConfig => ({
  ...t,
  colors: { ...t.colors },
  branding: { ...t.branding },
  fonts: { ...t.fonts },
  effects: {
    ...t.effects,
    blobs: t.effects.blobs.map(b => ({ ...b })),
    glowColors: [...t.effects.glowColors],
  },
});

const getNested = (obj: unknown, path: string): unknown =>
  path.split('.').reduce((o: unknown, k) => (o as Record<string, unknown>)?.[k], obj);

const setNested = (obj: unknown, path: string, value: unknown): void => {
  const keys = path.split('.');
  const last = keys.pop()!;
  const target = keys.reduce((o: unknown, k) => (o as Record<string, unknown>)[k], obj);
  (target as Record<string, unknown>)[last] = value;
};

// ─── Constants ────────────────────────────────────────────────────────────

const FONT_OPTIONS = [
  { label: 'Fraunces (project)', value: 'Fraunces, Georgia, serif' },
  { label: 'Recursive (project)', value: 'Recursive, system-ui, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'System Sans', value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Monospace', value: 'ui-monospace, SFMono-Regular, monospace' },
];

const TOKEN_SECTIONS: { section: string; tokens: { key: keyof ThemeColors; label: string }[] }[] = [
  {
    section: 'Surfaces',
    tokens: [
      { key: 'bgGlass', label: 'Glass' },
      { key: 'bgInput', label: 'Input' },
      { key: 'bgOverlay', label: 'Overlay' },
    ],
  },
  {
    section: 'Borders',
    tokens: [
      { key: 'borderDefault', label: 'Border Default' },
      { key: 'borderSubtle', label: 'Border Subtle' },
    ],
  },
  {
    section: 'Text',
    tokens: [
      { key: 'textPrimary', label: 'Text Primary' },
      { key: 'textSecondary', label: 'Text Secondary' },
      { key: 'textSubtle', label: 'Text Subtle' },
    ],
  },
  {
    section: 'Accents',
    tokens: [
      { key: 'brandBg', label: 'Brand BG' },
      { key: 'opmBg', label: 'OPM BG' },
      { key: 'returnsBg', label: 'Returns BG' },
      { key: 'lossBg', label: 'Loss BG' },
      { key: 'neutralBg', label: 'Neutral BG' },
    ],
  },
  {
    section: 'Interactive',
    tokens: [
      { key: 'focusRing', label: 'Focus Ring' },
      { key: 'sliderAccent', label: 'Slider' },
      { key: 'sliderAccentHover', label: 'Slider Hover' },
      { key: 'toggleOff', label: 'Toggle Off' },
      { key: 'scrollbarThumb', label: 'Scrollbar' },
      { key: 'scrollbarThumbHover', label: 'Scrollbar Hover' },
    ],
  },
];

/** Hint tooltips for specific tokens */
const TOKEN_HINTS: Partial<Record<keyof ThemeColors, string>> = {
  bgOverlay: 'Visible when Settings modal is open',
};

/** Keys that are primaries — shown in Primaries picker, skip lock/unlock UI in sections */
const PRIMARY_KEYS = new Set<keyof ThemeColors>(['bg', 'brand', 'brandAccent', 'returns', 'loss', 'startNow', 'opm', 'textNeutral']);

/** Derived token paths per primary — used for flash, sticky highlight, and tooltip content */
const DERIVED_PATHS: Record<string, string[]> = {
  bg: ['colors.bgGlass', 'colors.bgInput', 'colors.borderDefault'],
  brand: ['colors.brandBg', 'colors.focusRing', 'colors.sliderAccent', 'colors.sliderAccentHover', 'branding.heroLine1Color', 'branding.logoColor'],
  brandAccent: ['branding.heroLine2Color', 'effects.glowColors.0', 'effects.glowColors.1', 'effects.glowColors.2', 'effects.blobs.0.color', 'effects.blobs.1.color'],
  returns: ['colors.returnsBg'],
  loss: ['colors.lossBg'],
  startNow: [],
  opm: ['colors.opmBg'],
  textNeutral: ['colors.neutralBg'],
};

// ─── Sub-components ───────────────────────────────────────────────────────

const SectionHeader = ({
  label,
  showDivider = true,
  compactTop = false,
}: {
  label: string;
  showDivider?: boolean;
  compactTop?: boolean;
}) => (
  <div
    className={`text-[9px] font-black uppercase tracking-[0.2em] text-white/50 mb-2 ${compactTop ? 'mt-3' : 'mt-5'} ${showDivider ? 'border-t border-white/5 pt-3' : 'border-0 pt-0'}`}
  >
    {label.toUpperCase()}
  </div>
);

interface ColorInputProps {
  label: string;
  value: string;
  defaultValue: string;
  onChange: (hex: string) => void;
  locked?: boolean;
  onUnlock?: () => void;
  onRelock?: () => void;
  onFlash?: () => void;
  highlighted?: boolean;
  hint?: string;
}

const ColorInput = ({ label, value, defaultValue, onChange, locked, onUnlock, onRelock, onFlash, highlighted, hint }: ColorInputProps) => {
  const hex = toHex(value);
  const isDefault = value === defaultValue;
  const [hexDraft, setHexDraft] = useState(hex);
  const isLocked = locked === true;
  const hasLockBehavior = locked !== undefined;

  useEffect(() => { setHexDraft(toHex(value)); }, [value]);

  const commitHex = () => {
    const clean = hexDraft.startsWith('#') ? hexDraft : `#${hexDraft}`;
    if (/^#[0-9a-fA-F]{6}$/i.test(clean)) {
      onChange(clean.toLowerCase());
    } else {
      setHexDraft(hex);
    }
  };

  return (
    <div className="flex items-center gap-1.5 py-0.5 group/row">
      <input
        type="color"
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        className={`w-6 h-6 rounded border border-white/20 cursor-pointer bg-transparent p-0 shrink-0 ${isLocked ? 'pointer-events-none opacity-50' : ''}`}
      />
      {onFlash ? (
        <button
          type="button"
          onClick={onFlash}
          className={`text-[10px] font-bold uppercase tracking-wider truncate leading-tight text-left transition-colors cursor-pointer ${highlighted ? 'text-[#ff00ff]' : 'text-white/70 hover:text-white/90'}`}
          title="Flash to preview"
        >
          {label}
        </button>
      ) : (
        <div
          className={`text-[10px] font-bold uppercase tracking-wider truncate leading-tight ${highlighted ? 'text-[#ff00ff]' : 'text-white/70'}`}
        >
          {label}
        </div>
      )}
      {hint && (
        <span className="shrink-0 text-white/25" title={hint}>
          <Info size={10} />
        </span>
      )}
      <div className="flex-1 min-w-0" />
      {hasLockBehavior && (
        <button
          type="button"
          onClick={() => { if (isLocked && onUnlock) onUnlock(); else if (!isLocked && onRelock) onRelock(); }}
          className={`p-0.5 shrink-0 transition-colors ${isLocked ? 'text-white/40 hover:text-white/60' : 'text-teal-400 hover:text-teal-300'}`}
          title={isLocked ? 'Unlock for manual editing' : 'Re-lock (snap to derived value)'}
        >
          {isLocked ? <Lock size={10} /> : <Unlock size={10} />}
        </button>
      )}
      <input
        type="text"
        value={hexDraft}
        onChange={(e) => setHexDraft(e.target.value)}
        onBlur={commitHex}
        onKeyDown={(e) => { if (e.key === 'Enter') commitHex(); }}
        className={`w-[72px] text-[10px] font-mono text-white/60 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 outline-none focus:border-white/30 shrink-0 ${isLocked ? 'pointer-events-none opacity-50' : ''}`}
      />
      <button
        type="button"
        onClick={() => {
          if (!isDefault) onChange(defaultValue);
          if (hasLockBehavior && !isLocked) onRelock?.();
        }}
        className={`p-0.5 shrink-0 transition-colors ${isDefault ? 'text-white/[0.06] cursor-default' : 'text-white/30 hover:text-white/60'}`}
        title={hasLockBehavior && !isLocked ? 'Reset and re-lock' : 'Reset to default'}
        aria-disabled={isDefault}
      >
        <RotateCcw size={10} />
      </button>
    </div>
  );
};

interface TextInputProps {
  label: string;
  value: string;
  defaultValue: string;
  onChange: (v: string) => void;
}

const TextInput = ({ label, value, defaultValue, onChange }: TextInputProps) => {
  const isDefault = value === defaultValue;
  return (
    <div className="py-0.5 group/row">
      <div className="flex items-center justify-between mb-0.5">
        <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider">{label}</div>
        <button
          type="button"
          onClick={() => { if (!isDefault) onChange(defaultValue); }}
          className={`p-0.5 transition-colors ${isDefault ? 'text-white/[0.06] cursor-default' : 'text-white/30 hover:text-white/60'}`}
          title="Reset to default"
          aria-disabled={isDefault}
        >
          <RotateCcw size={10} />
        </button>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[11px] font-medium p-1.5 rounded-md border border-white/15 bg-black/30 text-white outline-none focus:border-teal-400/50"
      />
    </div>
  );
};

const FontSelect = ({ label, value, defaultValue, onChange }: TextInputProps) => {
  const isDefault = value === defaultValue;
  const isCustom = !FONT_OPTIONS.some(o => o.value === value);
  return (
    <div className="py-0.5 group/row">
      <div className="flex items-center justify-between mb-0.5">
        <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider">{label}</div>
        <button
          type="button"
          onClick={() => { if (!isDefault) onChange(defaultValue); }}
          className={`p-0.5 transition-colors ${isDefault ? 'text-white/[0.06] cursor-default' : 'text-white/30 hover:text-white/60'}`}
          title="Reset to default"
          aria-disabled={isDefault}
        >
          <RotateCcw size={10} />
        </button>
      </div>
      <select
        value={isCustom ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[11px] font-medium p-1.5 rounded-md border border-white/15 bg-black/30 text-white outline-none focus:border-teal-400/50"
      >
        {FONT_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
        {isCustom && <option value="" disabled>{value}</option>}
      </select>
      <div className="text-[9px] text-white/25 mt-0.5">Only pre-loaded and system fonts available</div>
    </div>
  );
};

// ─── Lab Instructions ─────────────────────────────────────────────────────

const LabInstructions = ({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className={open ? 'mb-3' : 'mb-2'}>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white/90 transition-colors"
      >
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        How to use Theme Lab
      </button>
      {open && (
        <ul className="mt-2 space-y-1 text-[10px] text-white/40 leading-relaxed pl-4">
          <li><strong className="text-white/55">SWATCHES</strong> Click a swatch to change that color.</li>
          <li><strong className="text-white/55">PRIMARIES</strong> The primary colors from which others derive. Changes update linked (derived) colors while those rows are locked.</li>
          <li><strong className="text-white/55">MODE</strong> Toggle dark, light, or auto to preview how colors behave.</li>
          <li><strong className="text-white/55">PRIMARY LABELS</strong> Click to flash that color in app and highlight linked rows. Click again to clear highlights.</li>
          <li><strong className="text-white/55">ROW LABELS</strong> Click to flash only that row in app.</li>
          <li><strong className="text-white/55">LOCKING</strong> Unlocked rows keep manual edits. Re-lock snaps back to the derived color.</li>
          <li><strong className="text-white/55">LOGO</strong> Upload any SVG; stroke color defaults to Brand and can be changed independently.</li>
          <li><strong className="text-white/55">RESET</strong> Row reset restores row. Header reset restores everything.</li>
          <li><strong className="text-white/55">SAVE</strong> Exports a TypeScript file you can share with the developer.</li>
        </ul>
      )}
    </div>
  );
};

// ─── Save / Export ────────────────────────────────────────────────────────

const generateThemeSource = (theme: ThemeConfig, name: string): string => {
  const id = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'untitled';
  const varName = id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

  let json = JSON.stringify(
    theme,
    (key, val) => (key === 'logo' ? '__LOGO__' : val),
    2,
  );
  json = json.replace('"__LOGO__"', 'CrownLogo');

  return [
    `import type { ThemeConfig } from './types';`,
    `import { CrownLogo } from '../components/CrownLogo';`,
    ``,
    `// TODO: Register in src/themes/index.ts`,
    `export const ${varName}Theme: ThemeConfig = ${json};`,
    ``,
  ].join('\n');
};

// ─── ThemeLab ─────────────────────────────────────────────────────────────

interface ThemeLabProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeLab = ({ isOpen, onClose }: ThemeLabProps) => {
  const { theme: activeTheme, setThemeId, themeId, setThemeOverride } = useTheme();
  const prevThemeId = useRef(themeId);
  const wasOpenRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const baseThemeRef = useRef<ThemeConfig>(cloneTheme(activeTheme));

  // Editable theme
  const [theme, setThemeLocal] = useState<ThemeConfig>(() => cloneTheme(activeTheme));
  const themeRef = useRef(theme);
  themeRef.current = theme;

  // Logo state
  const [customSvg, setCustomSvg] = useState<string | null>(null);
  // Source defaults for reset actions — captured from the active theme when Theme Lab opens.
  const [resetBaseTheme, setResetBaseTheme] = useState<ThemeConfig>(() => cloneTheme(activeTheme));

  // Save state
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  // Dark/Light/Auto mode
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'auto'>('auto');

  // Per-token lock state: absence = locked; stored as false = unlocked
  const [tokenLocks, setTokenLocks] = useState<Record<string, boolean>>(() => ({}));
  const tokenLocksRef = useRef<Record<string, boolean>>(tokenLocks);

  const setTokenLocksAndRef = useCallback((nextLocks: Record<string, boolean>) => {
    tokenLocksRef.current = nextLocks;
    setTokenLocks(nextLocks);
  }, []);

  useEffect(() => {
    tokenLocksRef.current = tokenLocks;
  }, [tokenLocks]);

  // Flash state: paths currently flashing (for label highlight)
  const [flashedPaths, setFlashedPaths] = useState<Set<string>>(() => new Set());
  const flashTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Sticky highlight: which primary's derived tokens are highlighted
  const [highlightedPrimary, setHighlightedPrimary] = useState<string | null>(null);

  // Combined set of paths to highlight (flash + sticky)
  const highlightedPaths = useMemo(() => {
    const paths = new Set(flashedPaths);
    if (highlightedPrimary) {
      for (const p of DERIVED_PATHS[highlightedPrimary] ?? []) paths.add(p);
    }
    return paths;
  }, [flashedPaths, highlightedPrimary]);

  const unlockToken = useCallback((path: string) => {
    const nextLocks = { ...tokenLocksRef.current, [path]: false };
    setTokenLocksAndRef(nextLocks);
  }, [setTokenLocksAndRef]);

  // Compute effective mode
  const effectiveMode: ThemeMode = useMemo(() => {
    if (themeMode === 'auto') {
      return relativeLuminance(theme.colors.bg) >= 0.5 ? 'light' : 'dark';
    }
    return themeMode;
  }, [themeMode, theme.colors.bg]);

  const relockToken = useCallback((path: string) => {
    const nextLocks = { ...tokenLocksRef.current };
    delete nextLocks[path];
    setTokenLocksAndRef(nextLocks);
    setThemeLocal((prev) =>
      applyLockedDerivations(prev, effectiveMode, nextLocks, { onlyPaths: [path] }),
    );
  }, [effectiveMode, setTokenLocksAndRef]);

  // Defaults computed through derivation engine from the current lab base theme.
  const defaults = useMemo(() => {
    return applyLockedDerivations(resetBaseTheme, effectiveMode, {});
  }, [effectiveMode, resetBaseTheme]);

  // ── Re-derive locked tokens when mode changes ──

  useEffect(() => {
    setThemeLocal((prev) => applyLockedDerivations(prev, effectiveMode, tokenLocksRef.current));
  }, [effectiveMode]);

  // ── Sync to ThemeProvider ──

  useEffect(() => {
    if (isOpen) setThemeOverride(theme);
  }, [theme, isOpen, setThemeOverride]);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      const base = cloneTheme(activeTheme);
      baseThemeRef.current = base;
      setResetBaseTheme(base);
      setThemeLocal(cloneTheme(base));
      if (themeId !== 'playground') {
        prevThemeId.current = themeId;
        setThemeId('playground');
      }
    }
    wasOpenRef.current = isOpen;
    // Override persists when panel closes so changes remain visible
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTheme]);

  // ── Value setters ──

  /** Set a color at a dot-path, preserving rgba alpha */
  const setColorAtPath = useCallback((path: string, newHex: string) => {
    setThemeLocal(prev => {
      const next = cloneTheme(prev);
      const cur = getNested(prev, path) as string;
      if (typeof cur === 'string' && cur.startsWith('rgba')) {
        const curAlpha = parseRgba(cur)?.[3] ?? 1;
        const hex = newHex.startsWith('#') ? newHex : toHex(newHex);
        const [r, g, b] = hexToRgb(hex);
        setNested(next, path, `rgba(${r}, ${g}, ${b}, ${curAlpha})`);
      } else {
        setNested(next, path, newHex);
      }
      return next;
    });
  }, []);

  /** Flash one or more token paths to magenta for 250ms.
   *  Pushes a flash theme through ThemeProvider (React render path) so both
   *  inline styles and CSS vars update. Labels highlight via flashedPaths state. */
  const flashPaths = useCallback((paths: string[]) => {
    const flashTheme = cloneTheme(themeRef.current);
    for (const path of paths) {
      const current = getNested(themeRef.current, path);
      if (typeof current !== 'string') continue;
      setNested(flashTheme, path, current.startsWith('#') ? '#ff00ff' : 'rgba(255, 0, 255, 0.8)');
    }

    setThemeOverride(flashTheme);
    setFlashedPaths(new Set(paths));

    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);

    flashTimerRef.current = setTimeout(() => {
      setThemeOverride(themeRef.current);
      setFlashedPaths(new Set());
      flashTimerRef.current = null;
    }, 250);
  }, [setThemeOverride]);

  /** Flash a single token path */
  const flashToken = useCallback((path: string) => {
    flashPaths([path]);
  }, [flashPaths]);

  /** Flash a primary and all its locked derived tokens + toggle sticky highlight */
  const flashPrimary = useCallback((primaryKey: string) => {
    const allPaths = [`colors.${primaryKey}`];
    for (const path of DERIVED_PATHS[primaryKey] ?? []) {
      if (isTokenLocked(tokenLocksRef.current, path)) allPaths.push(path);
    }
    flashPaths(allPaths);

    // Toggle sticky highlight
    setHighlightedPrimary(prev => prev === primaryKey ? null : primaryKey);
  }, [flashPaths]);

  /** Change a primary color and auto-update all locked derived tokens */
  const setPrimaryColor = useCallback((primaryKey: keyof Primaries, newHex: string) => {
    setThemeLocal((prev) => {
      const next = cloneTheme(prev);
      (next.colors as unknown as Record<string, string>)[primaryKey] = newHex;
      return applyLockedDerivations(next, effectiveMode, tokenLocksRef.current);
    });
  }, [effectiveMode]);

  /** Change textNeutral and re-derive neutralBg if locked */
  const setTextNeutralColor = useCallback((newHex: string) => {
    setThemeLocal((prev) => {
      const next = cloneTheme(prev);
      next.colors.textNeutral = newHex;
      return applyLockedDerivations(next, effectiveMode, tokenLocksRef.current, {
        onlyPaths: ['colors.neutralBg'],
      });
    });
  }, [effectiveMode]);

  const setBranding = useCallback((key: string, value: string) => {
    setThemeLocal(prev => ({
      ...prev,
      branding: { ...prev.branding, [key]: value },
    }));
  }, []);

  const setSubheadPart = useCallback((part: 'leading' | 'emphasis' | 'trailing', value: string) => {
    setThemeLocal(prev => {
      const parts = prev.branding.heroSubheadParts ?? { leading: '', emphasis: '', trailing: '' };
      const updated = { ...parts, [part]: value };
      return {
        ...prev,
        branding: {
          ...prev.branding,
          heroSubheadParts: updated,
          heroSubhead: `${updated.leading}${updated.emphasis}${updated.trailing}`,
        },
      };
    });
  }, []);

  const setFont = useCallback((key: string, value: string) => {
    setThemeLocal(prev => ({
      ...prev,
      fonts: { ...prev.fonts, [key]: value },
    }));
  }, []);

  const setBlobOpacity = useCallback((idx: number, value: number) => {
    setThemeLocal(prev => {
      const blobs = prev.effects.blobs.map((b, i) => i === idx ? { ...b, opacity: value } : b);
      return { ...prev, effects: { ...prev.effects, blobs } };
    });
  }, []);

  // ── Reset ──

  const handleReset = useCallback(() => {
    setThemeLocal(cloneTheme(baseThemeRef.current));
    setCustomSvg(null);
    setTokenLocksAndRef({});
    setThemeMode('auto');
    setHighlightedPrimary(null);
    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current);
      flashTimerRef.current = null;
    }
    setFlashedPaths(new Set());
  }, [setTokenLocksAndRef]);

  // ── SVG upload ──

  const handleSvgUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith('.svg')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const raw = reader.result as string;
      const clean = sanitizeSvg(raw);
      if (!clean) return; // malformed SVG — silently reject
      setCustomSvg(clean);
      // Create dynamic logo component from sanitized SVG
      const SvgLogo: LogoComponent = ({ className }) => (
        <div
          className={className}
          style={{ color: 'inherit' }}
          dangerouslySetInnerHTML={{ __html: prepareSvgHtml(clean) }}
        />
      );
      setThemeLocal(prev => ({
        ...prev,
        branding: { ...prev.branding, logo: SvgLogo },
      }));
    };
    reader.readAsText(file);
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  }, []);

  // ── Save / Export ──

  const handleDownload = useCallback(() => {
    const source = generateThemeSource(theme, saveName);
    const id = saveName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'untitled';
    const blob = new Blob([source], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${id}.ts`;
    a.click();
    URL.revokeObjectURL(url);
  }, [theme, saveName]);

  const handleCopy = useCallback(async () => {
    const source = generateThemeSource(theme, saveName);
    await navigator.clipboard.writeText(source);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 1500);
  }, [theme, saveName]);

  // ── Render ──

  if (!isOpen) return null;

  const def = defaults;
  const parts = theme.branding.heroSubheadParts ?? { leading: '', emphasis: '', trailing: '' };
  const defParts = def.branding.heroSubheadParts ?? { leading: '', emphasis: '', trailing: '' };

  return (
    <div
      className="fixed top-0 right-0 bottom-0 z-[9999] flex flex-col bg-neutral-500/50 backdrop-blur-xl border-l border-white/10 shadow-2xl w-[min(380px,100vw)]
        max-sm:top-auto max-sm:left-0 max-sm:w-full max-sm:h-[50dvh] max-sm:rounded-t-3xl max-sm:border-l-0 max-sm:border-t"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-teal-400" />
          <span className="text-sm font-black text-white tracking-tight">Theme Lab</span>
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-white/15 bg-white/10 text-content-secondary">
            Beta
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={handleReset} className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Reset all to defaults">
            <RotateCcw size={10} /> Reset
          </button>
          <button type="button" onClick={() => setShowSave(s => !s)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Save theme">
            <Download size={10} /> Save
          </button>
          <button type="button" onClick={onClose} className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded-md transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Save form */}
      {showSave && (
        <div className="px-4 py-3 border-b border-white/10 bg-black/30 space-y-2 shrink-0">
          <input
            type="text"
            placeholder="Theme name (e.g. Ocean Breeze)"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            className="w-full text-[11px] font-medium p-1.5 rounded-md border border-white/15 bg-black/30 text-white outline-none focus:border-teal-400/50"
          />
          <div className="flex gap-2">
            <button type="button" onClick={handleDownload} disabled={!saveName.trim()} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/60 border border-white/15 rounded-md hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <Download size={10} /> Download .ts
            </button>
            <button type="button" onClick={handleCopy} disabled={!saveName.trim()} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/60 border border-white/15 rounded-md hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <Copy size={10} /> {copyFeedback ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="text-[9px] text-white/25">Place file in src/themes/ and register in index.ts</div>
        </div>
      )}

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-8 custom-scrollbar">

        {/* ── Instructions ── */}
        <LabInstructions open={instructionsOpen} onToggle={() => setInstructionsOpen((prev) => !prev)} />

        {/* ── Mode ── */}
        <SectionHeader label="Mode" showDivider={instructionsOpen} compactTop />
        <div className="flex items-center gap-1 mb-3 p-1 rounded-lg bg-white/5 w-fit">
          {([
            { mode: 'dark' as const, icon: Moon, label: 'Dark' },
            { mode: 'light' as const, icon: Sun, label: 'Light' },
            { mode: 'auto' as const, icon: Zap, label: 'Auto' },
          ]).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setThemeMode(mode)}
              className={`flex items-center gap-1 px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-md transition-colors ${themeMode === mode
                ? 'bg-white/15 text-white'
                : 'text-white/40 hover:text-white/60'
                }`}
            >
              <Icon size={10} /> {label}
            </button>
          ))}
        </div>

        {/* ── Primaries ── */}
        <SectionHeader label="Primaries" />
        <div className="text-[9px] text-white/30 -mt-1 mb-2">
          Set primary colors. Derived tokens auto-update unless unlocked.
        </div>
        {theme.colors.bg !== defaults.colors.bg && (
          <p className="hidden max-sm:block text-[9px] font-bold text-white bg-red-600 rounded px-2 py-1 -mt-1 mb-2">
            ⚠ Address bar color updates when panel closes
          </p>
        )}

        {/* Primary color pickers */}
        {(['bg', 'brand', 'brandAccent', 'returns', 'loss', 'startNow', 'opm', 'textNeutral'] as const).map(key => {
          const derivedCount = DERIVED_PATHS[key]?.length ?? 0;
          const isDerivationPrimary = key !== 'textNeutral';
          const handleChange = (hex: string) =>
            isDerivationPrimary ? setPrimaryColor(key as keyof Primaries, hex) : setTextNeutralColor(hex);
          const handleReset = () => handleChange(def.colors[key]);
          const infoHint = (key === 'startNow' || key === 'loss') ? 'Visible when Start Age is adjusted' : undefined;
          return (
            <div key={key} className="flex items-center gap-1.5 py-0.5">
              <input
                type="color"
                value={toHex(theme.colors[key])}
                onChange={(e) => handleChange(e.target.value)}
                className="w-6 h-6 rounded border border-white/20 cursor-pointer bg-transparent p-0 shrink-0"
              />
              <button
                type="button"
                onClick={() => flashPrimary(key)}
                className={`text-[10px] font-bold uppercase tracking-wider truncate leading-tight text-left transition-colors cursor-pointer ${highlightedPrimary === key ? 'text-[#ff00ff]' : 'text-white/70 hover:text-white/90'}`}
                title={derivedCount > 0 ? 'Click to highlight derived tokens' : undefined}
              >
                {camelToLabel(key)}
                {highlightedPrimary === key && <span className="ml-1 text-[8px] opacity-60">●</span>}
              </button>
              {infoHint && (
                <span className="shrink-0 text-white/25" title={infoHint}>
                  <Info size={10} />
                </span>
              )}
              <div className="flex-1 min-w-0" />
              {derivedCount > 0 && (
                <span
                  className={`text-[8px] tabular-nums cursor-default ${highlightedPrimary === key ? 'text-[#ff00ff]' : 'text-white/25'}`}
                  title={(DERIVED_PATHS[key] ?? []).map(pathToLabel).join(', ')}
                >
                  {derivedCount} derived
                </span>
              )}
              <button
                type="button"
                onClick={handleReset}
                className={`p-0.5 shrink-0 transition-colors ${theme.colors[key] === def.colors[key]
                  ? 'text-white/[0.06] cursor-default'
                  : 'text-white/30 hover:text-white/60'
                  }`}
                title="Reset to default"
              >
                <RotateCcw size={10} />
              </button>
            </div>
          );
        })}

        {/* ── Token Sections ── */}
        {TOKEN_SECTIONS.map(({ section, tokens }) => (
          <div key={section}>
            <SectionHeader label={section} />
            {tokens.map(({ key, label }) => {
              const path = `colors.${key}`;
              const isPrimary = PRIMARY_KEYS.has(key);
              return (
                <ColorInput
                  key={key}
                  label={label}
                  value={theme.colors[key]}
                  defaultValue={def.colors[key]}
                  onChange={(hex) => setColorAtPath(path, hex)}
                  locked={!isPrimary ? isTokenLocked(tokenLocks, path) : undefined}
                  onUnlock={!isPrimary ? () => unlockToken(path) : undefined}
                  onRelock={!isPrimary ? () => relockToken(path) : undefined}
                  onFlash={() => flashToken(path)}
                  highlighted={highlightedPaths.has(path)}
                  hint={TOKEN_HINTS[key]}
                />
              );
            })}
          </div>
        ))}

        {/* ── Hero Colors ── */}
        <SectionHeader label="Hero Colors" />
        <ColorInput
          label="Hero Line 1 Color"
          value={theme.branding.heroLine1Color}
          defaultValue={def.branding.heroLine1Color}
          onChange={(hex) => setColorAtPath('branding.heroLine1Color', hex)}
          locked={isTokenLocked(tokenLocks, 'branding.heroLine1Color')}
          onUnlock={() => unlockToken('branding.heroLine1Color')}
          onRelock={() => relockToken('branding.heroLine1Color')}
          onFlash={() => flashToken('branding.heroLine1Color')}
          highlighted={highlightedPaths.has('branding.heroLine1Color')}
        />
        <ColorInput
          label="Hero Line 2 Color"
          value={theme.branding.heroLine2Color}
          defaultValue={def.branding.heroLine2Color}
          onChange={(hex) => setColorAtPath('branding.heroLine2Color', hex)}
          locked={isTokenLocked(tokenLocks, 'branding.heroLine2Color')}
          onUnlock={() => unlockToken('branding.heroLine2Color')}
          onRelock={() => relockToken('branding.heroLine2Color')}
          onFlash={() => flashToken('branding.heroLine2Color')}
          highlighted={highlightedPaths.has('branding.heroLine2Color')}
        />

        {/* ── Branding Copy ── */}
        <SectionHeader label="Branding Copy" />
        <TextInput label="App Name" value={theme.branding.appName} defaultValue={def.branding.appName} onChange={(v) => setBranding('appName', v)} />
        <TextInput label="Tagline" value={theme.branding.tagline} defaultValue={def.branding.tagline} onChange={(v) => setBranding('tagline', v)} />
        <TextInput label="Hero Line 1" value={theme.branding.heroLine1} defaultValue={def.branding.heroLine1} onChange={(v) => setBranding('heroLine1', v)} />
        <TextInput label="Hero Line 2" value={theme.branding.heroLine2} defaultValue={def.branding.heroLine2} onChange={(v) => setBranding('heroLine2', v)} />
        <div className="mt-1 text-[9px] text-white/30 mb-1">Subhead parts (leading · emphasis · trailing)</div>
        <TextInput label="Leading" value={parts.leading} defaultValue={defParts.leading} onChange={(v) => setSubheadPart('leading', v)} />
        <TextInput label="Emphasis" value={parts.emphasis} defaultValue={defParts.emphasis} onChange={(v) => setSubheadPart('emphasis', v)} />
        <TextInput label="Trailing" value={parts.trailing} defaultValue={defParts.trailing} onChange={(v) => setSubheadPart('trailing', v)} />

        {/* ── Logo ── */}
        <SectionHeader label="Logo" />
        <div className="flex items-center gap-3 py-2">
          <div
            className="w-12 h-12 rounded-lg border border-white/15 bg-black/30 flex items-center justify-center overflow-hidden shrink-0"
            style={{ color: theme.branding.logoColor }}
          >
            {customSvg ? (
              <div
                className="w-8 h-8"
                dangerouslySetInnerHTML={{ __html: prepareSvgHtml(customSvg) }}
              />
            ) : (
              <span className="text-[10px] text-white/30 font-bold">SVG</span>
            )}
          </div>
          <div className="flex-1 space-y-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white border border-white/15 hover:border-white/30 rounded-md transition-colors"
            >
              <Upload size={10} /> Upload SVG
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg"
              onChange={handleSvgUpload}
              className="hidden"
            />
            <ColorInput
              label="Stroke Color"
              value={theme.branding.logoColor}
              defaultValue={def.branding.logoColor}
              onChange={(hex) => setColorAtPath('branding.logoColor', hex)}
              locked={isTokenLocked(tokenLocks, 'branding.logoColor')}
              onUnlock={() => unlockToken('branding.logoColor')}
              onRelock={() => relockToken('branding.logoColor')}
              onFlash={() => flashToken('branding.logoColor')}
              highlighted={highlightedPaths.has('branding.logoColor')}
            />
            <div className="text-[9px] text-white/25">Derived from Brand while locked. Changing this affects only the logo.</div>
          </div>
        </div>

        {/* ── Fonts ── */}
        <SectionHeader label="Fonts" />
        <FontSelect label="Display" value={theme.fonts.display} defaultValue={def.fonts.display} onChange={(v) => setFont('display', v)} />
        <FontSelect label="Sans / UI" value={theme.fonts.sans} defaultValue={def.fonts.sans} onChange={(v) => setFont('sans', v)} />
        <FontSelect label="Mono (Numbers)" value={theme.fonts.mono} defaultValue={def.fonts.mono} onChange={(v) => setFont('mono', v)} />

        {/* ── Effects ── */}
        <SectionHeader label="Effects" />
        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Glow Colors</div>
          <span className="text-[8px] text-white/25 uppercase tracking-wider">Mobile only</span>
        </div>
        {theme.effects.glowColors.map((gc, i) => {
          const path = `effects.glowColors.${i}`;
          return (
            <ColorInput
              key={`glow-${i}`}
              label={`Glow ${i + 1}`}
              value={gc}
              defaultValue={def.effects.glowColors[i]}
              onChange={(hex) => setColorAtPath(path, hex)}
              locked={isTokenLocked(tokenLocks, path)}
              onUnlock={() => unlockToken(path)}
              onRelock={() => relockToken(path)}
              onFlash={() => flashToken(path)}
              highlighted={highlightedPaths.has(path)}
            />
          );
        })}

        <div className="flex items-baseline gap-2 mt-3 mb-1">
          <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Background Blobs</div>
          <span className="text-[8px] text-white/25 uppercase tracking-wider">Desktop only</span>
        </div>
        {theme.effects.blobs.map((blob, i) => {
          const path = `effects.blobs.${i}.color`;
          return (
            <div key={`blob-${i}`}>
              <ColorInput
                label={`Blob ${i + 1} (${blob.position})`}
                value={blob.color}
                defaultValue={def.effects.blobs[i].color}
                onChange={(hex) => setColorAtPath(path, hex)}
                locked={isTokenLocked(tokenLocks, path)}
                onUnlock={() => unlockToken(path)}
                onFlash={() => flashToken(path)}
                onRelock={() => relockToken(path)}
                highlighted={highlightedPaths.has(path)}
              />
              <div className="flex items-center gap-2 ml-8 -mt-0.5 mb-1">
                <span className="text-[9px] text-white/30">Opacity</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={blob.opacity}
                  onChange={(e) => setBlobOpacity(i, parseFloat(e.target.value))}
                  className="flex-1 h-1 accent-teal-400"
                />
                <span className="text-[9px] text-white/40 font-mono w-6 text-right">{blob.opacity}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
