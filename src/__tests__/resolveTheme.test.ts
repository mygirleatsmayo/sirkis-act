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
    expect(resolved.capabilities.subheadWrap).toBe('pretty');
    expect(resolved.capabilities.subheadWidowControl).toBe(true);
    expect(resolved.capabilities.showHeroLine1).toBe(true);
    expect(resolved.editor.kind).toBe('locked');
  });

  it('locks logo color mode editing by default when capability is intrinsic', () => {
    const resolved = resolveTheme({
      ...cyprusTheme,
      capabilities: { ...cyprusTheme.capabilities, logoColorMode: 'intrinsic' },
      editor: { kind: 'studio' },
    });

    expect(resolved.capabilities.logoColorMode).toBe('intrinsic');
    expect(resolved.editor.logoColorModeEditable).toBe(false);
  });

  it('respects explicit logo color mode editability override', () => {
    const resolved = resolveTheme({
      ...cyprusTheme,
      capabilities: { ...cyprusTheme.capabilities, logoColorMode: 'intrinsic' },
      editor: { kind: 'studio', logoColorModeEditable: true },
    });

    expect(resolved.capabilities.logoColorMode).toBe('intrinsic');
    expect(resolved.editor.logoColorModeEditable).toBe(true);
  });
});
