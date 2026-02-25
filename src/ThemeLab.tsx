import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link2, Unlink, RotateCcw, X, Upload, Palette, Download, Copy } from 'lucide-react';
import DOMPurify from 'dompurify';
import type { ThemeConfig, ThemeColors, LogoComponent } from './themes/types';
import { playgroundTheme } from './themes/playground';
import { useTheme } from './themes/useTheme';

// ─── Helpers ──────────────────────────────────────────────────────────────

const parseRgba = (s: string): [number, number, number, number] | null => {
  const m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (!m) return null;
  return [+m[1], +m[2], +m[3], m[4] != null ? +m[4] : 1];
};

const hexToRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const rgbToHex = (r: number, g: number, b: number): string =>
  '#' + [r, g, b].map(c => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('');

const toHex = (color: string): string => {
  if (color.startsWith('#')) return color.slice(0, 7).toLowerCase();
  const rgba = parseRgba(color);
  if (rgba) return rgbToHex(rgba[0], rgba[1], rgba[2]);
  return '#888888';
};

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

// ─── Color Family Detection ───────────────────────────────────────────────

interface FamilyMember {
  path: string;
  label: string;
  isRgba: boolean;
  alpha: number;
}

interface ColorFamily {
  id: string;
  hex: string;
  members: FamilyMember[];
}

const detectFamilies = (theme: ThemeConfig): ColorFamily[] => {
  const map = new Map<string, FamilyMember[]>();

  const add = (rawValue: string, path: string, label: string) => {
    const hex = toHex(rawValue).toLowerCase();
    const rgba = parseRgba(rawValue);
    const member: FamilyMember = {
      path,
      label,
      isRgba: !!rgba,
      alpha: rgba ? rgba[3] : 1,
    };
    const arr = map.get(hex) ?? [];
    arr.push(member);
    map.set(hex, arr);
  };

  for (const [k, v] of Object.entries(theme.colors)) add(v, `colors.${k}`, camelToLabel(k));
  add(theme.branding.heroLine1Color, 'branding.heroLine1Color', 'Hero Line 1 Color');
  add(theme.branding.heroLine2Color, 'branding.heroLine2Color', 'Hero Line 2 Color');
  theme.effects.glowColors.forEach((v, i) => add(v, `effects.glowColors.${i}`, `Glow ${i + 1}`));
  theme.effects.blobs.forEach((b, i) => add(b.color, `effects.blobs.${i}.color`, `Blob ${i + 1}`));

  return [...map.entries()]
    .filter(([_, members]) => members.length >= 2)
    .map(([hex, members]) => ({ id: hex, hex: hex.toUpperCase(), members }))
    .sort((a, b) => b.members.length - a.members.length);
};

const buildPathToFamily = (families: ColorFamily[]): Map<string, string> => {
  const m = new Map<string, string>();
  for (const f of families) for (const mem of f.members) m.set(mem.path, f.id);
  return m;
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
  familyHex?: string;
}

const ColorInput = ({ label, value, defaultValue, onChange, familyHex }: ColorInputProps) => {
  const hex = toHex(value);
  const isDefault = value === defaultValue;
  const [hexDraft, setHexDraft] = useState(hex);

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
      {familyHex && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: familyHex }}
          title={`Family ${familyHex}`}
        />
      )}
      <input
        type="color"
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 rounded border border-white/20 cursor-pointer bg-transparent p-0 shrink-0"
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
        className="w-[72px] text-[10px] font-mono text-white/60 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 outline-none focus:border-white/30 shrink-0"
      />
      <button
        type="button"
        onClick={() => { if (!isDefault) onChange(defaultValue); }}
        className={`p-0.5 shrink-0 transition-colors ${isDefault ? 'text-white/[0.06] cursor-default' : 'text-white/30 hover:text-white/60'}`}
        title="Reset to default"
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

const LinkToggle = ({ linked, onToggle }: { linked: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    className="p-1 rounded-md transition-colors hover:bg-white/10"
    title={linked ? 'Unlink (edit independently)' : 'Link (change together)'}
  >
    {linked ? <Link2 size={11} className="text-teal-400" /> : <Unlink size={11} className="text-white/30" />}
  </button>
);

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

  // Color families (detected once from defaults)
  const families = useMemo(() => detectFamilies(playgroundTheme), []);
  const pathToFamily = useMemo(() => buildPathToFamily(families), [families]);

  // Family link states
  const [familyLinks, setFamilyLinks] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    families.forEach(f => { init[f.id] = true; });
    return init;
  });
  const familyLinksRef = useRef(familyLinks);
  familyLinksRef.current = familyLinks;

  // Logo state
  const [customSvg, setCustomSvg] = useState<string | null>(null);

  // Save state
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

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

  /** Set a color at a dot-path, respecting family links and rgba alpha */
  const setColorAtPath = useCallback((path: string, newHex: string) => {
    setThemeLocal(prev => {
      const next = cloneTheme(prev);
      const familyId = pathToFamily.get(path);

      if (familyId && familyLinksRef.current[familyId]) {
        // Propagate to all family members
        const family = families.find(f => f.id === familyId);
        if (family) {
          const hex = newHex.startsWith('#') ? newHex : toHex(newHex);
          const [r, g, b] = hexToRgb(hex);
          for (const mem of family.members) {
            if (mem.isRgba) {
              const cur = getNested(next, mem.path) as string;
              const curAlpha = parseRgba(cur)?.[3] ?? mem.alpha;
              setNested(next, mem.path, `rgba(${r}, ${g}, ${b}, ${curAlpha})`);
            } else {
              setNested(next, mem.path, hex);
            }
          }
        }
      } else {
        // Single token — preserve alpha if rgba
        const cur = getNested(prev, path) as string;
        if (typeof cur === 'string' && cur.startsWith('rgba')) {
          const curAlpha = parseRgba(cur)?.[3] ?? 1;
          const hex = newHex.startsWith('#') ? newHex : toHex(newHex);
          const [r, g, b] = hexToRgb(hex);
          setNested(next, path, `rgba(${r}, ${g}, ${b}, ${curAlpha})`);
        } else {
          setNested(next, path, newHex);
        }
      }

      return next;
    });
  }, [pathToFamily, families]);

  /** Set a family color (always propagates to all members) */
  const setFamilyColor = useCallback((familyId: string, newHex: string) => {
    const family = families.find(f => f.id === familyId);
    if (!family) return;
    setThemeLocal(prev => {
      const next = cloneTheme(prev);
      const [r, g, b] = hexToRgb(newHex);
      for (const mem of family.members) {
        if (mem.isRgba) {
          const cur = getNested(next, mem.path) as string;
          const curAlpha = parseRgba(cur)?.[3] ?? mem.alpha;
          setNested(next, mem.path, `rgba(${r}, ${g}, ${b}, ${curAlpha})`);
        } else {
          setNested(next, mem.path, newHex);
        }
      }
      return next;
    });
  }, [families]);

  const toggleFamilyLink = useCallback((familyId: string) => {
    setFamilyLinks(prev => ({ ...prev, [familyId]: !prev[familyId] }));
  }, []);

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

  const resetFamily = useCallback((familyId: string) => {
    const family = families.find(f => f.id === familyId);
    if (!family) return;
    setThemeLocal(prev => {
      const next = cloneTheme(prev);
      for (const mem of family.members) {
        const defaultVal = getNested(defaults.current, mem.path);
        setNested(next, mem.path, defaultVal);
      }
      return next;
    });
  }, [families]);

  // ── Reset ──

  const handleReset = useCallback(() => {
    setThemeLocal(cloneTheme(playgroundTheme));
    setCustomSvg(null);
    const resetLinks: Record<string, boolean> = {};
    families.forEach(f => { resetLinks[f.id] = true; });
    setFamilyLinks(resetLinks);
  }, [families]);

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

  // Get current family hex from live theme (may have changed from default)
  const familyCurrentHex = (familyId: string): string => {
    const family = families.find(f => f.id === familyId);
    if (!family || family.members.length === 0) return familyId;
    const firstNonRgba = family.members.find(m => !m.isRgba);
    const member = firstNonRgba ?? family.members[0];
    return toHex(getNested(theme, member.path) as string);
  };

  return (
    <div
      className="fixed top-0 right-0 bottom-0 z-[9999] flex flex-col bg-[#0a1a19]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl"
      style={{ width: 'min(380px, 100vw)' }}
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
      <div className="flex-1 overflow-y-auto px-4 pb-8 custom-scrollbar">

        {/* ── Color Families ── */}
        <SectionHeader label="Color Families" />
        <div className="text-[9px] text-white/30 -mt-1 mb-2">Auto-detected shared colors. Linked families change together.</div>
        {families.map(family => {
          const currentHex = familyCurrentHex(family.id);
          const linked = familyLinks[family.id] ?? true;
          const isFamilyDefault = currentHex === family.id;
          return (
            <div key={family.id} className="mb-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={currentHex}
                  onChange={(e) => setFamilyColor(family.id, e.target.value)}
                  className="w-6 h-6 rounded border border-white/20 cursor-pointer bg-transparent p-0 shrink-0"
                />
                <div className="flex-1 min-w-0 text-[10px] font-bold text-white/70 uppercase tracking-wider truncate">
                  {family.hex} ({family.members.length})
                </div>
                <button
                  type="button"
                  onClick={() => { if (!isFamilyDefault) resetFamily(family.id); }}
                  className={`p-0.5 transition-colors ${isFamilyDefault ? 'text-white/[0.06] cursor-default' : 'text-white/30 hover:text-white/60'}`}
                  title="Reset family to default"
                  aria-disabled={isFamilyDefault}
                >
                  <RotateCcw size={10} />
                </button>
                <LinkToggle linked={linked} onToggle={() => toggleFamilyLink(family.id)} />
              </div>
              <div className="ml-8 mt-0.5 flex flex-wrap gap-x-2 gap-y-0">
                {family.members.map(m => (
                  <span key={m.path} className="text-[8px] text-white/30">{m.label}</span>
                ))}
              </div>
            </div>
          );
        })}

        {/* ── Token Sections ── */}
        {TOKEN_SECTIONS.map(({ section, tokens }) => (
          <div key={section}>
            <SectionHeader label={section} />
            {tokens.map(({ key, label }) => {
              const path = `colors.${key}`;
              const familyId = pathToFamily.get(path);
              return (
                <ColorInput
                  key={key}
                  label={label}
                  value={theme.colors[key]}
                  defaultValue={def.colors[key]}
                  onChange={(hex) => setColorAtPath(path, hex)}
                  familyHex={familyId ? familyCurrentHex(familyId) : undefined}
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
            familyHex={pathToFamily.has('branding.heroLine1Color') ? familyCurrentHex(pathToFamily.get('branding.heroLine1Color')!) : undefined}
          />
          <ColorInput
            label="Hero Line 2 Color"
            value={theme.branding.heroLine2Color}
            defaultValue={def.branding.heroLine2Color}
            onChange={(hex) => setColorAtPath('branding.heroLine2Color', hex)}
            familyHex={pathToFamily.has('branding.heroLine2Color') ? familyCurrentHex(pathToFamily.get('branding.heroLine2Color')!) : undefined}
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
              familyHex={pathToFamily.has('colors.brand') ? familyCurrentHex(pathToFamily.get('colors.brand')!) : undefined}
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
        <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1">Glow Colors</div>
        {theme.effects.glowColors.map((gc, i) => {
          const path = `effects.glowColors.${i}`;
          const familyId = pathToFamily.get(path);
          return (
            <ColorInput
              key={`glow-${i}`}
              label={`Glow ${i + 1}`}
              value={gc}
              defaultValue={def.effects.glowColors[i]}
              onChange={(hex) => setColorAtPath(path, hex)}
              familyHex={familyId ? familyCurrentHex(familyId) : undefined}
            />
          );
        })}

        <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider mt-3 mb-1">Background Blobs</div>
        {theme.effects.blobs.map((blob, i) => {
          const path = `effects.blobs.${i}.color`;
          const familyId = pathToFamily.get(path);
          return (
            <div key={`blob-${i}`}>
              <ColorInput
                label={`Blob ${i + 1} (${blob.position})`}
                value={blob.color}
                defaultValue={def.effects.blobs[i].color}
                onChange={(hex) => setColorAtPath(path, hex)}
                familyHex={familyId ? familyCurrentHex(familyId) : undefined}
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
