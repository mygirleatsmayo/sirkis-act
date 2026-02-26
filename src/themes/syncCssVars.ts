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

  // Glow effect colors
  theme.effects.glowColors.forEach((color, i) => {
    root.style.setProperty(`--glow-color-${i}`, color);
  });

  // Meta theme-color (needs full hex, not channels)
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme.colors.bg);

  // Body background
  document.body.style.backgroundColor = theme.colors.bg;
};
