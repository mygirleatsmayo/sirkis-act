import { describe, expect, it } from 'vitest';
import type { ThemeBranding } from '../themes/types';
import {
  applyNoWidow,
  getHeroVisibility,
  getNextSirkismIndex,
  getSafeSirkismIndex,
  getStructuredSubheadPieces,
  getSubheadWrapClass,
  resolveSubhead,
  shouldInsertSubheadBoundarySpace,
} from '../utils/branding';
import { DEFAULT_THEME_CAPABILITIES } from '../themes/resolveTheme';

const brandingBase: ThemeBranding = {
  logo: () => null,
  logoColor: '#fff',
  appName: 'Sirkis Act',
  tagline: 'Old-Fashioned Financial Planning',
  heroLine1: 'Line One',
  heroLine2: 'Line Two',
  heroSubhead: 'Plain text fallback',
  heroSubheadParts: {
    leading: 'Leading ',
    emphasis: 'emphasis',
    trailing: ' trailing text',
  },
  heroLine1Color: '#fff',
  heroLine2Color: '#fff',
};

describe('branding utils', () => {
  it('applies widow control to normal strings and trims trailing spaces', () => {
    expect(applyNoWidow('The quick brown fox')).toBe('The quick brown\u00A0fox');
    expect(applyNoWidow('The quick brown fox   ')).toBe('The quick brown\u00A0fox');
  });

  it('returns single word unchanged for widow control', () => {
    expect(applyNoWidow('Solo')).toBe('Solo');
  });

  it('falls back to plain subhead when structured mode has no parts', () => {
    const result = resolveSubhead(
      {
        ...brandingBase,
        heroSubhead: 'Fallback subhead text',
        heroSubheadParts: { leading: ' ', emphasis: '', trailing: '   ' },
      },
      'bold',
      true,
    );
    expect(result).toEqual({ kind: 'plain', text: 'Fallback subhead\u00A0text' });
  });

  it('preserves boundary spacing for structured subhead when widow control is on', () => {
    const result = resolveSubhead(
      {
        ...brandingBase,
        heroSubheadParts: {
          leading: 'Fall into a ',
          emphasis: 'Million\u2011Dollar Safety Net',
          trailing: ' with tax\u2011advantaged compounding.',
        },
      },
      'bold',
      true,
    );
    expect(result.kind).toBe('structured');
    if (result.kind !== 'structured') return;
    expect(`${result.leading}${result.emphasis}${result.trailing}`).toContain('Net with');
  });

  it('builds structured subhead output without requiring manual boundary spaces', () => {
    const pieces = getStructuredSubheadPieces('Fall into a', 'Million-Dollar Safety Net', 'with tax-advantaged compounding.');
    const rendered = pieces.map((part, idx) => `${idx > 0 ? ' ' : ''}${part.text}`).join('');
    expect(rendered).toContain('Net with');
  });

  it('does not insert auto-space when boundary is em dash', () => {
    expect(shouldInsertSubheadBoundarySpace('Risk—', 'adjusted')).toBe(false);
    expect(shouldInsertSubheadBoundarySpace('Risk', '—adjusted')).toBe(false);
    expect(shouldInsertSubheadBoundarySpace('Risk', 'adjusted')).toBe(true);
  });

  it('maps wrap mode to classes', () => {
    expect(getSubheadWrapClass('pretty')).toBe('text-pretty');
    expect(getSubheadWrapClass('balance')).toBe('text-balance');
    expect(getSubheadWrapClass('none')).toBe('');
  });

  it('computes hero visibility for mixed capability and content states', () => {
    const hiddenTagline = getHeroVisibility({
      capabilities: DEFAULT_THEME_CAPABILITIES,
      branding: { ...brandingBase, tagline: '   ' },
      hasLogoComponent: true,
      hasSubhead: true,
      sirkismsCount: 1,
    });
    expect(hiddenTagline.showTagline).toBe(false);
    expect(hiddenTagline.showHeroContainer).toBe(true);

    const noHeroElements = getHeroVisibility({
      capabilities: {
        ...DEFAULT_THEME_CAPABILITIES,
        showHeroLine1: true,
        showSubhead: false,
        showSirkisms: false,
        showHeroLine2: false,
      },
      branding: { ...brandingBase, heroLine1: '   ', heroLine2: '   ' },
      hasLogoComponent: false,
      hasSubhead: false,
      sirkismsCount: 0,
    });
    expect(noHeroElements.showHeroContainer).toBe(false);
  });

  it('guards sirkism index math for empty source', () => {
    expect(getSafeSirkismIndex(4, 0)).toBe(0);
    expect(getNextSirkismIndex(4, 0)).toBe(0);
    expect(getSafeSirkismIndex(5, 3)).toBe(2);
    expect(getNextSirkismIndex(2, 3)).toBe(0);
  });
});
