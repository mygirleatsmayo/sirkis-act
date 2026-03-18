import type { ThemeConfig } from './types';
import { cyprusTheme } from './cyprus';
import { LockLogo } from '../components/LockLogo';

/** QA fixture: visually Cyprus-like, but Theme Lab editing is locked */
export const cyprusLockedTheme: ThemeConfig = {
  ...cyprusTheme,
  id: 'cyprus-locked',
  name: 'Sirkis Cyprus (Locked)',
  colors: { ...cyprusTheme.colors },
  branding: { ...cyprusTheme.branding, logo: LockLogo },
  fonts: { ...cyprusTheme.fonts },
  effects: {
    blobs: cyprusTheme.effects.blobs.map((b) => ({ ...b })),
    glowColor: cyprusTheme.effects.glowColor,
    deboss: cyprusTheme.effects.deboss ? { ...cyprusTheme.effects.deboss } : undefined,
  },
  capabilities: {
    ...cyprusTheme.capabilities,
    logoColorMode: 'intrinsic',
  },
  editor: {
    kind: 'locked',
  },
};
