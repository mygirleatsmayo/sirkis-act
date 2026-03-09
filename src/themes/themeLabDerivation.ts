import type { ThemeConfig, ThemeColors } from './types';
import { applyDerivations, extractPrimaries, getModeStatics } from './derivationRules';
import type { ThemeMode } from './derivationRules';

export type TokenLocks = Record<string, boolean>;

export interface ApplyLockedDerivationsOptions {
  onlyPaths?: string[];
}

const PRIMARY_KEYS = new Set<keyof ThemeColors>([
  'bg',
  'brand',
  'brandAccent',
  'returns',
  'loss',
  'startNow',
  'opm',
  'textNeutral',
  'textPrimary',
  'textSecondary',
  'textSubtle',
  'target',
  'selfFunded',
]);

const cloneTheme = (t: ThemeConfig): ThemeConfig => ({
  ...t,
  colors: { ...t.colors },
  branding: { ...t.branding },
  fonts: { ...t.fonts },
  capabilities: t.capabilities ? { ...t.capabilities } : undefined,
  editor: t.editor ? { ...t.editor } : undefined,
  effects: {
    ...t.effects,
    blobs: t.effects.blobs.map((b) => ({ ...b })),
    glowColor: t.effects.glowColor,
  },
});

const shouldApplyPath = (path: string, onlyPathSet: Set<string> | null): boolean =>
  onlyPathSet === null || onlyPathSet.has(path);

export const isTokenLocked = (locks: TokenLocks, path: string): boolean =>
  locks[path] !== false;

export const applyLockedDerivations = (
  theme: ThemeConfig,
  mode: ThemeMode,
  locks: TokenLocks,
  options: ApplyLockedDerivationsOptions = {},
): ThemeConfig => {
  const next = cloneTheme(theme);
  const onlyPathSet = options.onlyPaths ? new Set(options.onlyPaths) : null;

  const primaries = extractPrimaries(next.colors);
  const derived = applyDerivations(primaries, mode);

  for (const [key, value] of Object.entries(derived.colors)) {
    if (PRIMARY_KEYS.has(key as keyof ThemeColors)) continue;
    const path = `colors.${key}`;
    if (!shouldApplyPath(path, onlyPathSet)) continue;
    if (isTokenLocked(locks, path)) {
      (next.colors as unknown as Record<string, string>)[key] = value;
    }
  }

  const brandingTargets: Array<[string, string]> = [
    ['branding.heroLine1Color', derived.heroLine1Color],
    ['branding.heroLine2Color', derived.heroLine2Color],
    ['branding.logoColor', derived.logoColor],
  ];
  for (const [path, value] of brandingTargets) {
    if (!shouldApplyPath(path, onlyPathSet)) continue;
    if (isTokenLocked(locks, path)) {
      const key = path.split('.').pop() as keyof ThemeConfig['branding'];
      (next.branding as unknown as Record<string, string>)[key] = value;
    }
  }

  const glowPath = 'effects.glowColor';
  if (shouldApplyPath(glowPath, onlyPathSet) && isTokenLocked(locks, glowPath)) {
    next.effects.glowColor = derived.glowColor;
  }

  derived.blobColors.forEach((bc, i) => {
    const path = `effects.blobs.${i}.color`;
    if (!shouldApplyPath(path, onlyPathSet)) return;
    if (isTokenLocked(locks, path)) {
      next.effects.blobs[i] = { ...next.effects.blobs[i], color: bc };
    }
  });

  const statics = getModeStatics(mode);
  for (const [key, value] of Object.entries(statics)) {
    const path = `colors.${key}`;
    if (!shouldApplyPath(path, onlyPathSet)) continue;
    if (isTokenLocked(locks, path)) {
      (next.colors as unknown as Record<string, string>)[key] = value as string;
    }
  }

  return next;
};
