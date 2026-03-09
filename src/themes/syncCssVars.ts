import type { ThemeConfig } from './types';

const camelToKebab = (s: string) =>
  s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/** Convert a hex color to space-separated RGB channels for Tailwind opacity support.
 *  Expects a 7-character string like '#00A499'. Returns the input unchanged if invalid. */
export const hexToChannels = (hex: string): string => {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
};

export const syncCssVars = (theme: ThemeConfig) => {
  const root = document.documentElement;

  // Colors — hex values stored as space-separated channels for Tailwind opacity support;
  // rgba values passed through as-is
  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(
      `--color-${camelToKebab(key)}`,
      value.startsWith('#') ? hexToChannels(value) : value,
    );
  }

  // Fonts
  root.style.setProperty('--font-display', theme.fonts.display);
  root.style.setProperty('--font-sans', theme.fonts.sans);
  root.style.setProperty('--font-mono', theme.fonts.mono);

  // Glow effect color (single token — CSS layers the box-shadow)
  root.style.setProperty('--glow-color', theme.effects.glowColor);

  // Meta theme-color (needs full hex, not channels)
  // Note: iOS Safari only updates the address bar color on layout reflow (e.g. drawer close)
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme.colors.bg);

  // Body background
  document.body.style.backgroundColor = theme.colors.bg;
};
