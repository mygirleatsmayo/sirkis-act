import { describe, expect, it } from 'vitest';
import { cyprusTheme } from '../themes/cyprus';
import { applyDerivations, extractPrimaries } from '../themes/derivationRules';
import { applyLockedDerivations } from '../themes/themeLabDerivation';
import type { ThemeConfig, ThemeColors } from '../themes/types';

const PRIMARY_KEYS = new Set<keyof ThemeColors>([
  'bg',
  'brand',
  'brandAccent',
  'returns',
  'loss',
  'startNow',
  'opm',
  'textNeutral',
  'textOnBrand',
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
  effects: {
    ...t.effects,
    blobs: t.effects.blobs.map((b) => ({ ...b })),
    glowColor: t.effects.glowColor,
  },
});

describe('themeLabDerivation helpers', () => {
  it('applies all locked derived paths for dark mode', () => {
    const input = cloneTheme(cyprusTheme);
    input.colors.brand = '#ff3300';
    input.colors.brandAccent = '#2255ff';
    input.branding.heroLine1Color = '#111111';
    input.branding.heroLine2Color = '#222222';
    input.branding.logoColor = '#333333';
    input.effects.glowColor = 'rgba(1, 1, 1, 0.1)';
    input.effects.blobs[0] = { ...input.effects.blobs[0], color: 'rgba(4, 4, 4, 0.1)' };
    input.effects.blobs[1] = { ...input.effects.blobs[1], color: 'rgba(5, 5, 5, 0.1)' };

    const expected = applyDerivations(extractPrimaries(input.colors), 'dark');
    const result = applyLockedDerivations(input, 'dark', {});

    for (const [key, value] of Object.entries(expected.colors)) {
      if (PRIMARY_KEYS.has(key as keyof ThemeColors)) continue;
      expect((result.colors as unknown as Record<string, string>)[key]).toBe(value);
    }
    expect(result.branding.heroLine1Color).toBe(expected.heroLine1Color);
    expect(result.branding.heroLine2Color).toBe(expected.heroLine2Color);
    expect(result.branding.logoColor).toBe(expected.logoColor);
    expect(result.effects.glowColor).toBe(expected.glowColor);
    expect(result.effects.blobs[0].color).toBe(expected.blobColors[0]);
    expect(result.effects.blobs[1].color).toBe(expected.blobColors[1]);

    // Pure helper: input remains unchanged.
    expect(input.branding.heroLine1Color).toBe('#111111');
  });

  it('does not overwrite explicitly unlocked derived tokens', () => {
    const input = cloneTheme(cyprusTheme);
    input.colors.brand = '#ff5500';
    input.colors.brandBg = 'rgba(1, 2, 3, 0.4)';
    input.branding.heroLine1Color = '#222222';
    const locks = {
      'colors.brandBg': false,
      'branding.heroLine1Color': false,
    };

    const result = applyLockedDerivations(input, 'dark', locks);

    expect(result.colors.brandBg).toBe('rgba(1, 2, 3, 0.4)');
    expect(result.branding.heroLine1Color).toBe('#222222');
    expect(result.colors.focusRing).toBe('#ff5500');
    expect(result.colors.sliderAccent).toBe('#ff5500');
  });

  it('preserves textSecondary as a primary (not overwritten by derivations)', () => {
    const input = cloneTheme(cyprusTheme);
    input.colors.textSecondary = '#654321';

    const result = applyLockedDerivations(input, 'light', {});

    // textSecondary is a primary — it passes through unchanged
    expect(result.colors.textSecondary).toBe('#654321');
  });

  it('does not overwrite edited text primaries on mode re-derive', () => {
    const input = cloneTheme(cyprusTheme);
    input.colors.textPrimary = '#112233';
    input.colors.textNeutral = '#223344';

    const result = applyLockedDerivations(input, 'light', {});

    expect(result.colors.textPrimary).toBe('#112233');
    expect(result.colors.textNeutral).toBe('#223344');
  });

  it('derives neutralBg from edited textNeutral when locked', () => {
    const input = cloneTheme(cyprusTheme);
    input.colors.textNeutral = '#112233';

    const result = applyLockedDerivations(input, 'dark', {});

    expect(result.colors.neutralBg).toBe('rgba(17, 34, 51, 0.1)');
  });

  it('supports targeted re-derive by path via onlyPaths', () => {
    const input = cloneTheme(cyprusTheme);
    input.colors.brand = '#00aa44';
    input.branding.logoColor = '#101010';
    input.branding.heroLine1Color = '#202020';
    input.colors.brandBg = 'rgba(9, 9, 9, 0.2)';

    const result = applyLockedDerivations(input, 'dark', {}, { onlyPaths: ['branding.logoColor'] });

    expect(result.branding.logoColor).toBe('#00aa44');
    expect(result.branding.heroLine1Color).toBe('#202020');
    expect(result.colors.brandBg).toBe('rgba(9, 9, 9, 0.2)');
  });

  it('updates branding and effects derived tokens when locked', () => {
    const input = cloneTheme(cyprusTheme);
    input.colors.brand = '#11aa77';
    input.colors.brandAccent = '#aa1177';
    input.branding.heroLine1Color = '#010101';
    input.branding.heroLine2Color = '#020202';
    input.branding.logoColor = '#030303';
    input.effects.glowColor = 'rgba(0, 0, 0, 0.1)';
    input.effects.blobs[0] = { ...input.effects.blobs[0], color: 'rgba(0, 0, 0, 0.1)' };
    input.effects.blobs[1] = { ...input.effects.blobs[1], color: 'rgba(0, 0, 0, 0.1)' };

    const expected = applyDerivations(extractPrimaries(input.colors), 'dark');
    const result = applyLockedDerivations(input, 'dark', {});

    expect(result.branding.heroLine1Color).toBe(expected.heroLine1Color);
    expect(result.branding.heroLine2Color).toBe(expected.heroLine2Color);
    expect(result.branding.logoColor).toBe(expected.logoColor);
    expect(result.effects.glowColor).toBe(expected.glowColor);
    expect(result.effects.blobs[0].color).toBe(expected.blobColors[0]);
    expect(result.effects.blobs[1].color).toBe(expected.blobColors[1]);
  });
});
