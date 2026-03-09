export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  items: string[];
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: '1.4.0',
    date: '2026-03-09',
    title: 'New Logo, Theme Lab Overhaul & Branding Flexibility',
    items: [
      "Dropping your savings into a piggy bank? Think bigger! Meet Babar, Sirkis Act's new mascot and logo. He's here to help you save a trunk-load of cash with good old-fashioned financial planning (for capitalists who love money).",
      'Theme Lab colors now split into Source (auto-syncs linked tones) and Standalone (fully manual) groups.',
      'New Auto/Manual derivation toggle: flip to Manual for full control over every color without auto-updates.',
      'Theme Lab tooltips now work on mobile: tap an info icon to read the hint, tap anywhere else to dismiss.',
      'Missing logo, tagline, or hero content no longer causes layout shifts or empty space.',
      'Theme Lab no longer restores in-progress edits on page refresh — you always start fresh from the saved theme.',
      '...And many more Theme Lab improvements!',
    ],
  },
  {
    version: '1.3.1',
    date: '2026-03-04',
    title: 'Tooltip Hover Scope Fix',
    items: [
      'Desktop sidebar input tooltips now trigger only from the info icon, not the full input row',
    ],
  },
  {
    version: '1.3.0',
    date: '2026-03-04',
    title: 'Theme Lab Robustness, Derivation, and Token Semantics',
    items: [
      'Lock-aware derivation application and targeted re-lock snap behavior',
      'textPrimary/textNeutral primary consistency and neutralBg derivation alignment',
      'Logo token wiring, lossBg wiring, and badge background token mapping',
      'Theme Lab UX/control updates: derived grouping, tooltips/copy refresh, beta badge',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-02-26',
    title: 'Settings Modal & Theme Lab Polish',
    items: [
      'Settings modal with changelog, Theme Lab launch, and Welcome Tour stub',
      'Theme Lab: instructions section, mobile bottom sheet, 50% transparency',
      'Device-only labels, playground DRY refactor, hex validation guard',
      'Mobile gear button made stateless for iOS; salary presets extracted',
    ],
  },
  {
    version: '1.1.0-rc.1',
    date: '2026-02-25',
    title: 'Theme Architecture & Theme Lab',
    items: [
      'Runtime theme system with CSS variable sync and Tailwind semantic tokens',
      'Theme Lab: live-editing panel for colors, fonts, SVG logos, and branding',
      'SVG sanitization via DOMPurify',
      'TypeScript project references for cleaner builds',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-02-24',
    title: 'Code Quality & Infrastructure',
    items: [
      'Module extraction, MetricCard component, performance optimization',
      'Unit tests (33 tests), accessibility audit, ESLint v9',
      'Meta tags, SEO, and retroactive versioning',
    ],
  },
  {
    version: '0.9.0',
    date: '2026-02-21',
    title: 'UX Polish & Copy',
    items: [
      'Loss panel responsive sizing and copy improvements',
      'Stat icon radius and icon updates',
    ],
  },
];
