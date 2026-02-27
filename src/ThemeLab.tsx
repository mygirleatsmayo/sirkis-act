import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Lock, Unlock, RotateCcw, X, Upload, Palette, Download, Copy, ChevronDown, Sun, Moon, Zap } from 'lucide-react';
import DOMPurify from 'dompurify';
import type { ThemeConfig, ThemeColors, LogoComponent } from './themes/types';
import { playgroundTheme } from './themes/playground';
import { useTheme } from './themes/useTheme';
import { hexToRgb, parseRgba, toHex, relativeLuminance } from './utils/colorMath';
import { applyDerivations, extractPrimaries, getModeStatics } from './themes/derivationRules';
import type { Primaries, ThemeMode } from './themes/derivationRules';

// ─── Helpers ──────────────────────────────────────────────────────────────

const camelToLabel = (s: string): string =>
  s.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim();

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
      { key: 'bg', label: 'Background' },
      { key: 'bgGlass', label: 'Glass' },
      { key: 'bgCard', label: 'Card' },
      { key: 'bgInput', label: 'Input' },
      { key: 'bgOverlay', label: 'Overlay' },
      { key: 'bgMuted', label: 'Muted' },
    ],
  },
  {
    section: 'Borders',
    tokens: [
      { key: 'borderDefault', label: 'Default' },
      { key: 'borderSubtle', label: 'Subtle' },
    ],
  },
  {
    section: 'Text',
    tokens: [
      { key: 'textPrimary', label: 'Primary' },
      { key: 'textSecondary', label: 'Secondary' },
      { key: 'textMuted', label: 'Muted' },
      { key: 'textSubtle', label: 'Subtle' },
      { key: 'textOnBrand', label: 'On Brand' },
    ],
  },
  {
    section: 'Accents',
    tokens: [
      { key: 'brand', label: 'Brand' },
      { key: 'brandBg', label: 'Brand BG' },
      { key: 'opm', label: 'Employer (OPM)' },
      { key: 'returns', label: 'Returns' },
      { key: 'returnsBg', label: 'Returns BG' },
      { key: 'startNow', label: 'Start Now' },
      { key: 'startNowBg', label: 'Start Now BG' },
      { key: 'loss', label: 'Loss' },
      { key: 'lossBg', label: 'Loss BG' },
      { key: 'neutral', label: 'Neutral' },
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

/** Keys that are primaries (not derived) — skip lock/unlock UI for these */
const PRIMARY_KEYS = new Set<keyof ThemeColors>(['bg', 'brand', 'returns', 'loss', 'startNow', 'opm']);

// ─── Sub-components ───────────────────────────────────────────────────────

const SectionHeader = ({ label }: { label: string }) => (
  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 mt-5 mb-2 border-t border-white/5 pt-3 first:mt-0 first:border-0 first:pt-0">
    {label}
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
}

const ColorInput = ({ label, value, defaultValue, onChange, locked, onUnlock, onRelock }: ColorInputProps) => {
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
      {hasLockBehavior && (
        <button
          type="button"
          onClick={() => { if (isLocked && onUnlock) onUnlock(); else if (!isLocked && onRelock) onRelock(); }}
          className={`p-0.5 shrink-0 transition-colors ${isLocked ? 'text-white/20 hover:text-white/40' : 'text-teal-400/70 hover:text-teal-400'}`}
          title={isLocked ? 'Unlock for manual editing' : 'Re-lock (snap to derived value)'}
        >
          {isLocked ? <Lock size={10} /> : <Unlock size={10} />}
        </button>
      )}
      <input
        type="color"
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        className={`w-6 h-6 rounded border border-white/20 cursor-pointer bg-transparent p-0 shrink-0 ${isLocked ? 'pointer-events-none opacity-50' : ''}`}
      />
      <div className="flex-1 min-w-0 text-[10px] font-bold text-white/70 uppercase tracking-wider truncate leading-tight">
        {label}
      </div>
      <input
        type="text"
        value={hexDraft}
        onChange={(e) => setHexDraft(e.target.value)}
        onBlur={commitHex}
        onKeyDown={(e) => { if (e.key === 'Enter') commitHex(); }}
        className={`w-[72px] text-[10px] font-mono text-white/60 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 outline-none focus:border-white/30 shrink-0 ${isLocked ? 'pointer-events-none opacity-50' : ''}`}
      />
      {!hasLockBehavior && (
        <button
          type="button"
          onClick={() => { if (!isDefault) onChange(defaultValue); }}
          className={`p-0.5 shrink-0 transition-colors ${isDefault ? 'text-white/[0.06] cursor-default' : 'text-white/30 hover:text-white/60'}`}
          title="Reset to default"
          aria-disabled={isDefault}
        >
          <RotateCcw size={10} />
        </button>
      )}
      {hasLockBehavior && !isLocked && (
        <button
          type="button"
          onClick={() => { if (!isDefault) onChange(defaultValue); }}
          className={`p-0.5 shrink-0 transition-colors ${isDefault ? 'text-white/[0.06] cursor-default' : 'text-white/30 hover:text-white/60'}`}
          title="Reset to default"
          aria-disabled={isDefault}
        >
          <RotateCcw size={10} />
        </button>
      )}
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

const LabInstructions = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white/60 transition-colors"
      >
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        How to use Theme Lab
      </button>
      {open && (
        <ul className="mt-2 space-y-1 text-[10px] text-white/40 leading-relaxed pl-4">
          <li><strong className="text-white/55">Primaries</strong> set the 6 base colors. Derived tokens auto-update unless manually unlocked.</li>
          <li><strong className="text-white/55">Token Sections</strong> let you fine-tune individual colors (surfaces, text, accents, etc.).</li>
          <li><strong className="text-white/55">Branding</strong> controls hero copy, subheadline parts, and hero line colors.</li>
          <li><strong className="text-white/55">Logo</strong> accepts any SVG upload; stroke color syncs with Brand accent.</li>
          <li><strong className="text-white/55">Save</strong> exports a TypeScript theme file you can submit to the developer for inclusion in a future release.</li>
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
  const { setThemeId, themeId, setThemeOverride } = useTheme();
  const prevThemeId = useRef(themeId);
  const defaults = useRef(cloneTheme(playgroundTheme));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable theme
  const [theme, setThemeLocal] = useState<ThemeConfig>(() => cloneTheme(playgroundTheme));

  // Logo state
  const [customSvg, setCustomSvg] = useState<string | null>(null);

  // Save state
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Dark/Light/Auto mode
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'auto'>('dark');

  // Per-token lock state: absence = locked; stored as false = unlocked
  const [tokenLocks, setTokenLocks] = useState<Record<string, boolean>>(() => ({}));

  const isTokenLocked = useCallback((path: string): boolean => {
    return tokenLocks[path] !== false;
  }, [tokenLocks]);

  const unlockToken = useCallback((path: string) => {
    setTokenLocks(prev => ({ ...prev, [path]: false }));
  }, []);

  const relockToken = useCallback((path: string) => {
    setTokenLocks(prev => {
      const next = { ...prev };
      delete next[path];
      return next;
    });
  }, []);

  // Compute effective mode
  const effectiveMode: ThemeMode = useMemo(() => {
    if (themeMode === 'auto') {
      return relativeLuminance(theme.colors.bg) >= 0.5 ? 'light' : 'dark';
    }
    return themeMode;
  }, [themeMode, theme.colors.bg]);

  // ── Sync to ThemeProvider ──

  useEffect(() => {
    if (isOpen) setThemeOverride(theme);
  }, [theme, isOpen, setThemeOverride]);

  useEffect(() => {
    if (isOpen && themeId !== 'playground') {
      prevThemeId.current = themeId;
      setThemeId('playground');
    }
    // Override persists when panel closes so changes remain visible
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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

  /** Change a primary color and auto-update all locked derived tokens */
  const setPrimaryColor = useCallback((primaryKey: keyof Primaries, newHex: string) => {
    setThemeLocal(prev => {
      const next = cloneTheme(prev);
      (next.colors as unknown as Record<string, string>)[primaryKey] = newHex;

      if (primaryKey === 'opm') return next; // standalone, no derivations

      const primaries = extractPrimaries(next.colors);
      const derived = applyDerivations(primaries, effectiveMode);

      // Apply derived values only to LOCKED tokens
      for (const [key, value] of Object.entries(derived.colors)) {
        if (PRIMARY_KEYS.has(key as keyof ThemeColors)) continue;
        if (isTokenLocked(`colors.${key}`)) {
          (next.colors as unknown as Record<string, string>)[key] = value;
        }
      }

      // branding
      if (isTokenLocked('branding.heroLine1Color')) {
        next.branding.heroLine1Color = derived.heroLine1Color;
      }
      if (isTokenLocked('branding.heroLine2Color')) {
        next.branding.heroLine2Color = derived.heroLine2Color;
      }

      // glow colors
      derived.glowColors.forEach((gc, i) => {
        if (isTokenLocked(`effects.glowColors.${i}`)) {
          next.effects.glowColors[i] = gc;
        }
      });

      // blob colors
      derived.blobColors.forEach((bc, i) => {
        if (isTokenLocked(`effects.blobs.${i}.color`)) {
          next.effects.blobs[i] = { ...next.effects.blobs[i], color: bc };
        }
      });

      // mode-dependent statics
      const statics = getModeStatics(effectiveMode);
      for (const [key, value] of Object.entries(statics)) {
        if (isTokenLocked(`colors.${key}`)) {
          (next.colors as unknown as Record<string, string>)[key] = value as string;
        }
      }

      return next;
    });
  }, [effectiveMode, isTokenLocked]);

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
    setThemeLocal(cloneTheme(playgroundTheme));
    setCustomSvg(null);
    setTokenLocks({});
    setThemeMode('dark');
  }, []);

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

  const def = defaults.current;
  const parts = theme.branding.heroSubheadParts ?? { leading: '', emphasis: '', trailing: '' };
  const defParts = def.branding.heroSubheadParts ?? { leading: '', emphasis: '', trailing: '' };

  return (
    <div
      className="fixed top-0 right-0 bottom-0 z-[9999] flex flex-col bg-[#0a1a19]/50 backdrop-blur-xl border-l border-white/10 shadow-2xl w-[min(380px,100vw)]
        max-sm:top-auto max-sm:left-0 max-sm:w-full max-sm:h-[50dvh] max-sm:rounded-t-3xl max-sm:border-l-0 max-sm:border-t"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-teal-400" />
          <span className="text-sm font-black text-white tracking-tight">Theme Lab</span>
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
        <LabInstructions />

        {/* ── Primaries ── */}
        <SectionHeader label="Primaries" />
        <div className="text-[9px] text-white/30 -mt-1 mb-2">
          Set primary colors. Derived tokens auto-update unless unlocked.
        </div>

        {/* Mode toggle */}
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
              className={`flex items-center gap-1 px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-md transition-colors ${
                themeMode === mode
                  ? 'bg-white/15 text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Icon size={10} /> {label}
            </button>
          ))}
        </div>

        {/* Primary color pickers */}
        {(['bg', 'brand', 'returns', 'loss', 'startNow', 'opm'] as const).map(key => {
          const derivedCount = key === 'opm' ? 0
            : key === 'bg' ? 5
            : key === 'brand' ? 5
            : key === 'returns' ? 7
            : key === 'loss' ? 1
            : 1; // startNow
          return (
            <div key={key} className="flex items-center gap-1.5 py-0.5">
              <input
                type="color"
                value={toHex(theme.colors[key])}
                onChange={(e) => setPrimaryColor(key, e.target.value)}
                className="w-6 h-6 rounded border border-white/20 cursor-pointer bg-transparent p-0 shrink-0"
              />
              <div className="flex-1 min-w-0 text-[10px] font-bold text-white/70 uppercase tracking-wider truncate leading-tight">
                {camelToLabel(key)}
              </div>
              {derivedCount > 0 && (
                <span className="text-[8px] text-white/25 tabular-nums">{derivedCount} derived</span>
              )}
              <button
                type="button"
                onClick={() => {
                  setPrimaryColor(key, def.colors[key]);
                }}
                className={`p-0.5 shrink-0 transition-colors ${
                  theme.colors[key] === def.colors[key]
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
                  locked={!isPrimary ? isTokenLocked(path) : undefined}
                  onUnlock={!isPrimary ? () => unlockToken(path) : undefined}
                  onRelock={!isPrimary ? () => relockToken(path) : undefined}
                />
              );
            })}
          </div>
        ))}

        {/* ── Branding ── */}
        <SectionHeader label="Branding" />
        <TextInput label="App Name" value={theme.branding.appName} defaultValue={def.branding.appName} onChange={(v) => setBranding('appName', v)} />
        <TextInput label="Tagline" value={theme.branding.tagline} defaultValue={def.branding.tagline} onChange={(v) => setBranding('tagline', v)} />
        <TextInput label="Hero Line 1" value={theme.branding.heroLine1} defaultValue={def.branding.heroLine1} onChange={(v) => setBranding('heroLine1', v)} />
        <TextInput label="Hero Line 2" value={theme.branding.heroLine2} defaultValue={def.branding.heroLine2} onChange={(v) => setBranding('heroLine2', v)} />
        <div className="mt-1 text-[9px] text-white/30 mb-1">Subhead parts (leading · emphasis · trailing)</div>
        <TextInput label="Leading" value={parts.leading} defaultValue={defParts.leading} onChange={(v) => setSubheadPart('leading', v)} />
        <TextInput label="Emphasis" value={parts.emphasis} defaultValue={defParts.emphasis} onChange={(v) => setSubheadPart('emphasis', v)} />
        <TextInput label="Trailing" value={parts.trailing} defaultValue={defParts.trailing} onChange={(v) => setSubheadPart('trailing', v)} />

        <div className="mt-2">
          <ColorInput
            label="Hero Line 1 Color"
            value={theme.branding.heroLine1Color}
            defaultValue={def.branding.heroLine1Color}
            onChange={(hex) => setColorAtPath('branding.heroLine1Color', hex)}
            locked={isTokenLocked('branding.heroLine1Color')}
            onUnlock={() => unlockToken('branding.heroLine1Color')}
            onRelock={() => relockToken('branding.heroLine1Color')}
          />
          <ColorInput
            label="Hero Line 2 Color"
            value={theme.branding.heroLine2Color}
            defaultValue={def.branding.heroLine2Color}
            onChange={(hex) => setColorAtPath('branding.heroLine2Color', hex)}
            locked={isTokenLocked('branding.heroLine2Color')}
            onUnlock={() => unlockToken('branding.heroLine2Color')}
            onRelock={() => relockToken('branding.heroLine2Color')}
          />
        </div>

        {/* ── Logo ── */}
        <SectionHeader label="Logo" />
        <div className="flex items-center gap-3 py-2">
          <div
            className="w-12 h-12 rounded-lg border border-white/15 bg-black/30 flex items-center justify-center overflow-hidden shrink-0"
            style={{ color: theme.colors.brand }}
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
              value={theme.colors.brand}
              defaultValue={def.colors.brand}
              onChange={(hex) => setColorAtPath('colors.brand', hex)}
            />
            <div className="text-[9px] text-white/25">Synced with Brand accent color</div>
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
              locked={isTokenLocked(path)}
              onUnlock={() => unlockToken(path)}
              onRelock={() => relockToken(path)}
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
                locked={isTokenLocked(path)}
                onUnlock={() => unlockToken(path)}
                onRelock={() => relockToken(path)}
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
