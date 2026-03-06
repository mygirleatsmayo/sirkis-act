import type { ThemeConfig } from './types';
import { CrownLogo } from '../components/CrownLogo';

export const cyprusTheme: ThemeConfig = {
  id: 'cyprus',
  name: 'Sirkis Cyprus',
  colors: {
    bg: '#003D3A',
    bgGlass: '#004745',
    bgInput: '#002E2B',
    bgOverlay: 'rgba(15, 23, 42, 0.4)',

    borderDefault: '#006560',
    borderSubtle: 'rgba(255, 255, 255, 0.06)',

    textPrimary: '#ffffff',
    textSecondary: '#e2e8f0',
    textNeutral: '#e2e8f0',
    textSubtle: '#94a3b8',

    brand: '#00A499',
    brandBg: 'rgba(0, 164, 153, 0.06)',
    opm: '#74c365',
    opmBg: 'rgba(116, 195, 101, 0.08)',
    returns: '#E6C300',
    returnsBg: 'rgba(230, 195, 0, 0.08)',
    brandAccent: '#E6C300',
    startNow: '#5CE6E6',
    loss: '#E65C5C',
    lossBg: 'rgba(230, 92, 92, 0.07)',
    neutralBg: 'rgba(226, 232, 240, 0.10)',

    focusRing: '#00A499',
    sliderAccent: '#00A499',
    sliderAccentHover: '#008b81',
    toggleOff: '#cbd5e1',
    scrollbarThumb: 'rgba(148, 163, 184, 0.3)',
    scrollbarThumbHover: 'rgba(148, 163, 184, 0.5)',
  },
  branding: {
    logo: CrownLogo,
    logoColor: '#00A499',
    appName: 'Sirkis Act',
    tagline: 'Old-Fashioned Financial Planning',
    heroLine1: "Dr. Sirkis's",
    heroLine2: 'High\u2011Wire Act',
    heroSubhead: 'Fall into a Million\u2011Dollar Safety Net with tax\u2011advantaged compounding.',
    heroSubheadParts: {
      leading: 'Fall into a',
      emphasis: 'Million\u2011Dollar Safety Net',
      trailing: 'with tax\u2011advantaged compounding.',
    },
    heroLine1Color: '#00A499',
    heroLine2Color: '#E6C300',
  },
  fonts: {
    display: 'Fraunces, Georgia, serif',
    sans: 'Recursive, system-ui, sans-serif',
    mono: 'Recursive, system-ui, sans-serif',
  },
  effects: {
    blobs: [
      { color: 'rgba(230, 195, 0, 0.10)', position: 'top-right', opacity: 1 },
      { color: 'rgba(230, 195, 0, 0.05)', position: 'bottom-right', opacity: 1 },
    ],
    glowColors: [
      'rgba(230, 195, 0, 0.50)',
      'rgba(230, 195, 0, 0.32)',
      'rgba(230, 195, 0, 0.20)',
    ],
  },
  capabilities: {
    showLogo: true,
    showTagline: true,
    showHeroLine1: true,
    showHeroLine2: true,
    showSubhead: true,
    showSirkisms: true,
    subheadMode: 'bold',
    logoColorMode: 'themed',
  },
  editor: {
    kind: 'studio',
  },
};
