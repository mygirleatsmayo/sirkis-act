import type { ThemeBranding, ThemeCapabilities } from '../themes/types';

export const hasVisibleText = (value: string | null | undefined): boolean =>
  typeof value === 'string' && value.trim().length > 0;

const normalizeSpaces = (value: string): string => value.replace(/\s+/g, ' ').trim();

export const applyNoWidow = (value: string): string => {
  const normalized = normalizeSpaces(value);
  const lastSpace = normalized.lastIndexOf(' ');
  if (lastSpace < 0) return normalized;
  return `${normalized.slice(0, lastSpace)}\u00A0${normalized.slice(lastSpace + 1)}`;
};

export type ResolvedSubhead =
  | { kind: 'none' }
  | { kind: 'plain'; text: string }
  | { kind: 'structured'; leading: string; emphasis: string; trailing: string };

export interface StructuredSubheadPiece {
  text: string;
  emphasis: boolean;
}

const applyWidowToStructuredParts = (
  leading: string,
  emphasis: string,
  trailing: string,
): { leading: string; emphasis: string; trailing: string } => {
  const applyToPart = (part: string): string => {
    const prefix = part.match(/^\s*/)?.[0] ?? '';
    const suffix = part.match(/\s*$/)?.[0] ?? '';
    const core = part.trim();
    if (!core.includes(' ')) return part;
    return `${prefix}${applyNoWidow(core)}${suffix}`;
  };

  if (trailing.trim().includes(' ')) {
    return { leading, emphasis, trailing: applyToPart(trailing) };
  }
  if (emphasis.trim().includes(' ')) {
    return { leading, emphasis: applyToPart(emphasis), trailing };
  }
  if (leading.trim().includes(' ')) {
    return { leading: applyToPart(leading), emphasis, trailing };
  }
  return { leading, emphasis, trailing };
};

export const resolveSubhead = (
  branding: ThemeBranding,
  _subheadMode: ThemeCapabilities['subheadMode'],
  widowControlEnabled: boolean,
): ResolvedSubhead => {
  const leading = branding.heroSubheadParts?.leading ?? '';
  const emphasis = branding.heroSubheadParts?.emphasis ?? '';
  const trailing = branding.heroSubheadParts?.trailing ?? '';
  const hasStructured = hasVisibleText(leading) || hasVisibleText(emphasis) || hasVisibleText(trailing);

  if (hasStructured) {
    if (!widowControlEnabled) return { kind: 'structured', leading, emphasis, trailing };
    return { kind: 'structured', ...applyWidowToStructuredParts(leading, emphasis, trailing) };
  }

  if (!hasVisibleText(branding.heroSubhead)) return { kind: 'none' };
  const plain = widowControlEnabled ? applyNoWidow(branding.heroSubhead) : normalizeSpaces(branding.heroSubhead);
  return { kind: 'plain', text: plain };
};

export const getSubheadWrapClass = (
  subheadWrap: ThemeCapabilities['subheadWrap'],
): '' | 'text-pretty' | 'text-balance' => {
  if (subheadWrap === 'pretty') return 'text-pretty';
  if (subheadWrap === 'balance') return 'text-balance';
  return '';
};

export const getStructuredSubheadPieces = (
  leading: string,
  emphasis: string,
  trailing: string,
): StructuredSubheadPiece[] => {
  const parts: StructuredSubheadPiece[] = [
    { text: leading.trim(), emphasis: false },
    { text: emphasis.trim(), emphasis: true },
    { text: trailing.trim(), emphasis: false },
  ];
  return parts.filter((part) => part.text.length > 0);
};

export const shouldInsertSubheadBoundarySpace = (
  previousText: string,
  nextText: string,
): boolean => {
  const prev = previousText.trimEnd();
  const next = nextText.trimStart();
  if (!prev || !next) return false;
  return !prev.endsWith('—') && !next.startsWith('—');
};

export interface HeroVisibility {
  showLogo: boolean;
  showTagline: boolean;
  showHeroTitle: boolean;
  showSubhead: boolean;
  showSirkisms: boolean;
  showHeroContainer: boolean;
}

export const getHeroVisibility = ({
  capabilities,
  branding,
  hasLogoComponent,
  hasSubhead,
  sirkismsCount,
}: {
  capabilities: ThemeCapabilities;
  branding: ThemeBranding;
  hasLogoComponent: boolean;
  hasSubhead: boolean;
  sirkismsCount: number;
}): HeroVisibility => {
  const heroLine1 = branding.heroLine1?.trim() ?? '';
  const heroLine2 = branding.heroLine2?.trim() ?? '';

  const showLogo = capabilities.showLogo && hasLogoComponent;
  const showTagline = capabilities.showTagline && hasVisibleText(branding.tagline);
  const showHeroTitle = (capabilities.showHeroLine1 && heroLine1.length > 0) || (capabilities.showHeroLine2 && heroLine2.length > 0);
  const showSubhead = capabilities.showSubhead && hasSubhead;
  const showSirkisms = capabilities.showSirkisms && sirkismsCount > 0;

  return {
    showLogo,
    showTagline,
    showHeroTitle,
    showSubhead,
    showSirkisms,
    showHeroContainer: showHeroTitle || showSubhead || showSirkisms,
  };
};

export const getNextSirkismIndex = (current: number, count: number): number => {
  if (count <= 0) return 0;
  return (current + 1) % count;
};

export const getSafeSirkismIndex = (current: number, count: number): number => {
  if (count <= 0) return 0;
  return ((current % count) + count) % count;
};
