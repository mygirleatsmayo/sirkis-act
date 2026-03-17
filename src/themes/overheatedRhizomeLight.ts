import type { ThemeConfig } from './types';
import { ElephantLogo } from '../components/ElephantLogo';

export const overheatedRhizomeLightTheme: ThemeConfig = {
  id: 'overheated-rhizome-light',
  name: 'Overheated Rhizome',
  colors: {
    bg: '#FAF0E8',
    bgGlass: '#F0E0CC',
    bgInput: '#EDD8BE',
    bgOverlay: 'rgba(24, 12, 8, 0.4)',

    borderDefault: '#D0B090',
    borderSubtle: 'rgba(24, 12, 8, 0.06)',
    borderMuted: 'rgba(24, 12, 8, 0.10)',

    textPrimary: '#180C08',
    textSecondary: '#3A2820',
    textNeutral: '#604838',
    textSubtle: '#806050',
    textOnBrand: '#FAF0E8',

    brand: '#881840',
    brandBg: 'rgba(136, 24, 64, 0.06)',
    opm: '#1A70A0',
    opmBg: 'rgba(26, 112, 160, 0.08)',
    returns: '#1A7828',
    returnsBg: 'rgba(26, 120, 40, 0.08)',
    brandAccent: '#704028',
    startNow: '#7038A8',
    loss: '#C02020',
    lossBg: 'rgba(192, 32, 32, 0.07)',
    neutralBg: 'rgba(24, 12, 8, 0.10)',

    mutedBg: 'rgba(0, 0, 0, 0.05)',
    surfaceHover: 'rgba(24, 12, 8, 0.06)',
    surfaceSunken: 'rgba(0, 0, 0, 0.06)',

    target: '#881840',
    targetBg: 'rgba(136, 24, 64, 0.06)',
    selfFunded: '#881840',
    selfFundedBg: 'rgba(136, 24, 64, 0.06)',

    focusRing: '#881840',
    sliderAccent: '#881840',
    sliderAccentHover: '#6A1030',
    toggleOff: '#B8A898',
    scrollbarThumb: 'rgba(136, 24, 64, 0.30)',
    scrollbarThumbHover: 'rgba(136, 24, 64, 0.50)',
  },
  branding: {
    logo: ElephantLogo,
    logoColor: '#881840',
    appName: 'Overheated Rhizome',
    tagline: 'those who put the diss in dissertation',
    heroLine1: 'Overheated',
    heroLine2: 'Rhizome',
    heroSubhead: 'Compound quietly, accumulate relentlessly, and return to the earth with a million dollars.',
    heroSubheadParts: {
      leading: 'Compound quietly, accumulate relentlessly, and',
      emphasis: 'return to the earth',
      trailing: 'with a million dollars.',
    },
    heroLine1Color: '#881840',
    heroLine2Color: '#704028',
  },
  fonts: {
    display: 'Spectral, Georgia, serif',
    sans: 'Space Grotesk, system-ui, sans-serif',
    mono: 'Space Mono, ui-monospace, monospace',
  },
  effects: {
    blobs: [
      { color: 'rgba(136, 24, 64, 0.06)', position: 'top-right', opacity: 1 },
      { color: 'rgba(112, 64, 40, 0.05)', position: 'bottom-right', opacity: 1 },
    ],
    glowColor: 'rgba(136, 24, 64, 0.35)',
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
    kind: 'studioNoDerivation',
  },
};
