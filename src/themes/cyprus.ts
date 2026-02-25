import type { ThemeConfig } from './types';
import { CrownLogo } from '../components/CrownLogo';

export const cyprusTheme: ThemeConfig = {
  id: 'cyprus',
  name: 'Sirkis Cyprus',
  colors: {
    bg: '#003D3A',
    bgGlass: '#004745',
    bgCard: '#004240',
    bgInput: '#002E2B',
    bgOverlay: 'rgba(15, 23, 42, 0.4)',
    bgMuted: 'rgba(0, 61, 58, 0.6)',

    borderDefault: '#006560',
    borderSubtle: 'rgba(255, 255, 255, 0.06)',

    textPrimary: '#ffffff',
    textSecondary: '#e2e8f0',
    textMuted: '#cbd5e1',
    textSubtle: '#94a3b8',
    textOnBrand: '#ffffff',

    brand: '#00A499',
    brandBg: 'rgba(0, 164, 153, 0.06)',
    opm: '#A8A8A8',
    returns: '#E6C300',
    returnsBg: 'rgba(230, 195, 0, 0.08)',
    startNow: '#0D9488',
    startNowBg: 'rgba(13, 148, 136, 0.08)',
    loss: '#D32F2F',
    lossBg: 'rgba(211, 47, 47, 0.07)',
    neutral: 'rgba(255, 255, 255, 0.10)',

    focusRing: '#00A499',
    sliderAccent: '#00A499',
    sliderAccentHover: '#0D9488',
    toggleOff: '#cbd5e1',
    scrollbarThumb: 'rgba(148, 163, 184, 0.3)',
    scrollbarThumbHover: 'rgba(148, 163, 184, 0.5)',
  },
  branding: {
    logo: CrownLogo,
    appName: 'Sirkis Act',
    tagline: 'Old-Fashioned Financial Planning',
    heroLine1: "Dr. Sirkis's",
    heroLine2: 'High-Wire Act',
    heroSubhead: 'Fall into a Million-Dollar Safety Net with tax-advantaged compounding.',
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
};
