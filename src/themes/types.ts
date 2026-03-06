import type { ComponentType } from 'react';

/** Logo component contract — receives className for sizing */
export type LogoComponent = ComponentType<{ className?: string }>;

export interface ThemeColors {
  // Backgrounds (darkest → lightest for dark themes; reversed for light)
  bg: string;                 // body / main background
  bgGlass: string;            // GlassCard / sidebar / elevated surfaces
  bgInput: string;            // input, select, number fields
  bgOverlay: string;          // modal overlays, drawer overlay

  // Borders
  borderDefault: string;      // input borders, dividers
  borderSubtle: string;       // card borders, faint separators

  // Text
  textPrimary: string;        // headings, primary content
  textSecondary: string;      // secondary labels, values
  textNeutral: string;        // neutral/real-value text (neither growth nor loss)
  textSubtle: string;         // helper text, timestamps, faint labels

  // Semantic accents
  brand: string;              // primary brand / Your Contributions
  brandBg: string;            // brand tint background
  opm: string;                // Employer Match (OPM)
  opmBg: string;              // OPM tint background (derived from opm)
  returns: string;            // Investment Returns / gold accent
  returnsBg: string;          // returns tint background
  brandAccent: string;        // brand accent / hero line 2 / section headers / blobs / glows
  startNow: string;           // Start Now comparison line
  loss: string;               // loss / error / destructive
  lossBg: string;             // loss tint background
  neutralBg: string;          // neutral badge background (derived from textNeutral)

  // Interactive
  focusRing: string;          // focus-visible outlines
  sliderAccent: string;       // range input accent
  sliderAccentHover: string;  // range input accent hover
  toggleOff: string;          // toggle switch off-state track
  scrollbarThumb: string;     // custom scrollbar thumb
  scrollbarThumbHover: string;
}

export interface ThemeBranding {
  logo: LogoComponent;
  logoColor: string;           // logo stroke/fill color
  appName: string;              // e.g. 'Sirkis Act'
  tagline: string;              // e.g. 'Old-Fashioned Financial Planning'
  heroLine1: string;            // e.g. "Dr. Sirkis's"
  heroLine2: string;            // e.g. 'High-Wire Act'
  heroSubhead: string;          // plain-text fallback for SEO / accessibility
  heroSubheadParts: {           // structured rendering with emphasis span
    leading: string;
    emphasis: string;
    trailing: string;
  };
  heroLine1Color: string;       // color for hero line 1
  heroLine2Color: string;       // color for hero line 2
}

export interface ThemeFonts {
  display: string;              // e.g. 'Fraunces, Georgia, serif'
  sans: string;                 // e.g. 'Recursive, system-ui, sans-serif'
  mono: string;                 // e.g. 'JetBrains Mono, ui-monospace, monospace' — for financial figures
}

export interface ThemeEffects {
  blobs: {
    color: string;
    position: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
    opacity: number;
  }[];
  glowColors: string[];         // rgba strings for pulse-glow animation
}

export interface ThemeCapabilities {
  showLogo: boolean;
  showTagline: boolean;
  showHeroLine1: boolean;
  showHeroLine2: boolean;
  showSubhead: boolean;
  showSirkisms: boolean;
  subheadMode: 'plain' | 'bold' | 'italic' | 'boldItalic';
  subheadWrap: 'pretty' | 'balance' | 'none';
  subheadWidowControl: boolean;
  logoColorMode: 'themed' | 'intrinsic';
}

export interface ThemeEditorConfig {
  kind: 'studio' | 'locked';
  logoColorModeEditable: boolean;
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: ThemeColors;
  branding: ThemeBranding;
  fonts: ThemeFonts;
  effects: ThemeEffects;
  capabilities?: Partial<ThemeCapabilities>;
  editor?: Partial<ThemeEditorConfig>;
}

export interface ResolvedThemeConfig extends ThemeConfig {
  capabilities: ThemeCapabilities;
  editor: ThemeEditorConfig;
}
