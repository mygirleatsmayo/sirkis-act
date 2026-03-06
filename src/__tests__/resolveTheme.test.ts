import { describe, it, expect } from 'vitest';
import { cyprusTheme } from '../themes/cyprus';
import { resolveTheme, DEFAULT_THEME_CAPABILITIES, DEFAULT_THEME_EDITOR } from '../themes/resolveTheme';

describe('resolveTheme', () => {
  it('fills capability and editor defaults when omitted', () => {
    const resolved = resolveTheme({
      ...cyprusTheme,
      capabilities: undefined,
      editor: undefined,
    });

    expect(resolved.capabilities).toEqual(DEFAULT_THEME_CAPABILITIES);
    expect(resolved.editor).toEqual(DEFAULT_THEME_EDITOR);
  });

  it('preserves explicit token overrides and merges capability overrides', () => {
    const resolved = resolveTheme({
      ...cyprusTheme,
      colors: { ...cyprusTheme.colors, textSecondary: '#800080' },
      capabilities: { showSirkisms: false, subheadMode: 'plain' },
      editor: { kind: 'locked' },
    });

    expect(resolved.colors.textSecondary).toBe('#800080');
    expect(resolved.capabilities.showSirkisms).toBe(false);
    expect(resolved.capabilities.subheadMode).toBe('plain');
    expect(resolved.capabilities.showHero).toBe(true);
    expect(resolved.editor.kind).toBe('locked');
  });
});
