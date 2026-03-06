import { describe, it, expect } from 'vitest';
import { themes } from '../themes';
import { resolveTheme } from '../themes/resolveTheme';

describe('theme registry compatibility', () => {
  it('resolves all registered themes with capability and editor metadata', () => {
    Object.values(themes).forEach((theme) => {
      const resolved = resolveTheme(theme);
      expect(resolved.capabilities.showHero).toBeTypeOf('boolean');
      expect(resolved.capabilities.logoColorMode).toMatch(/themed|intrinsic/);
      expect(resolved.editor.kind).toMatch(/studio|locked/);
    });
  });

  it('includes a locked QA theme fixture', () => {
    expect(themes['cyprusLocked']).toBeDefined();
    const resolved = resolveTheme(themes['cyprusLocked']);
    expect(resolved.editor.kind).toBe('locked');
  });
});
