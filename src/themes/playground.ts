import type { ThemeConfig } from './types';
import { cyprusTheme } from './cyprus';

/** ThemeLab working copy — deep clone of Cyprus with distinct id/name */
export const playgroundTheme: ThemeConfig = {
  ...cyprusTheme,
  id: 'playground',
  name: 'Playground',
  colors: { ...cyprusTheme.colors },
  branding: { ...cyprusTheme.branding },
  fonts: { ...cyprusTheme.fonts },
  capabilities: { ...cyprusTheme.capabilities, logoColorMode: 'intrinsic' },
  editor: { ...cyprusTheme.editor, logoColorModeEditable: true },
  effects: {
    blobs: cyprusTheme.effects.blobs.map((b) => ({ ...b })),
    glowColors: [...cyprusTheme.effects.glowColors],
  },
};
