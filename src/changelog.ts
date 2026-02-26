export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  items: string[];
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
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
