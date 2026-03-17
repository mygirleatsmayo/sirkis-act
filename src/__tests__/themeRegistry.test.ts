import { describe, it, expect } from 'vitest';
import { themes, getSelectableThemes } from '../themes';
import { resolveTheme } from '../themes/resolveTheme';

describe('theme registry compatibility', () => {
  it('includes new semantic surface and border tokens on all themes', () => {
    Object.values(themes).forEach((theme) => {
      expect(theme.colors.surfaceHover).toBeTypeOf('string');
      expect(theme.colors.surfaceSunken).toBeTypeOf('string');
      expect(theme.colors.borderMuted).toBeTypeOf('string');
    });
  });

  it('resolves all registered themes with capability and editor metadata', () => {
    Object.values(themes).forEach((theme) => {
      const resolved = resolveTheme(theme);
      expect(resolved.capabilities.showHeroLine1).toBeTypeOf('boolean');
      expect(resolved.capabilities.logoColorMode).toMatch(/themed|intrinsic/);
      expect(resolved.capabilities.subheadWrap).toMatch(/pretty|balance|none/);
      expect(resolved.capabilities.subheadWidowControl).toBeTypeOf('boolean');
      expect(resolved.editor.kind).toMatch(/studio|locked/);
      expect(resolved.editor.logoColorModeEditable).toBeTypeOf('boolean');
    });
  });

  it('includes a locked QA theme fixture', () => {
    expect(themes['cyprusLocked']).toBeDefined();
    const resolved = resolveTheme(themes['cyprusLocked']);
    expect(resolved.editor.kind).toBe('locked');
  });
});

describe('getSelectableThemes', () => {
  it('returns themes excluding playground and locked fixtures', () => {
    const selectable = getSelectableThemes();
    const ids = selectable.map(t => t.id);
    expect(ids).not.toContain('playground');
    expect(ids).not.toContain('cyprusLocked');
    expect(ids).toContain('cyprus');
  });

  it('returns array of ThemeConfig objects', () => {
    const selectable = getSelectableThemes();
    expect(selectable.length).toBeGreaterThan(0);
    for (const t of selectable) {
      expect(t).toHaveProperty('id');
      expect(t).toHaveProperty('name');
      expect(t).toHaveProperty('colors');
    }
  });
});
