import { describe, it, expect } from 'vitest';
import { themes } from '../themes';
import { resolveTheme } from '../themes/resolveTheme';

describe('theme registry compatibility', () => {
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
