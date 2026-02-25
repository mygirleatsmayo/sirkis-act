# Custom Fonts via URL — Theme Lab

## Goal
Let users paste a Google Fonts (or any CSS font) URL in the Theme Lab and have it load live, replacing the Display, Sans, or Mono (Numbers) font slot.

## Current State
- `ThemeFonts` type in `src/themes/types.ts` has three slots: `display`, `sans`, `mono`
- Font values are CSS `font-family` strings (e.g. `'Fraunces, Georgia, serif'`)
- `syncCssVars.ts` sets `--font-display`, `--font-sans`, `--font-mono` on `:root`
- Tailwind maps these in `tailwind.config.js` as `font-display`, `font-sans`, `font-mono`
- ThemeLab currently offers a dropdown of pre-loaded project fonts + system fonts
- The `mono` slot is wired to financial figures via `font-mono` class on number elements in `App.tsx`

## Phase 1: Runtime `<link>` Injection (MVP)

### Changes

**`src/themes/types.ts`** — Add optional font URL fields:
```ts
export interface ThemeFonts {
  display: string;
  sans: string;
  mono: string;
  displayUrl?: string;  // e.g. 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap'
  sansUrl?: string;
  monoUrl?: string;
}
```

**`src/themes/syncCssVars.ts`** — Inject/remove `<link>` tags:
```ts
// Track injected links by slot
const fontLinks = new Map<string, HTMLLinkElement>();

function syncFontLink(slot: string, url: string | undefined) {
  const existing = fontLinks.get(slot);
  if (existing?.href === url) return;
  existing?.remove();
  if (url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.dataset.themeFont = slot;
    document.head.appendChild(link);
    fontLinks.set(slot, link);
  } else {
    fontLinks.delete(slot);
  }
}
```
Call `syncFontLink('display', theme.fonts.displayUrl)` etc. inside `syncCssVars`.

**`src/ThemeLab.tsx`** — Add URL text input below each `FontSelect`:
- When the user pastes a URL, store it in local state and on `theme.fonts.<slot>Url`
- After the CSS loads (`document.fonts.ready`), try to detect the family name from `document.fonts`
- Auto-populate the font-family string, or let the user type it manually
- Show a loading indicator while the font loads
- Show an error if the URL fails to load

### UX Flow
1. User selects "Custom URL..." from the font dropdown (new option at bottom)
2. A text input appears for the URL
3. A second text input appears for the font-family name (auto-detected if possible)
4. Font loads in the background; live preview updates once ready

### Font Name Auto-Detection
After `<link>` loads:
```ts
await document.fonts.ready;
const newFamilies = [...document.fonts]
  .filter(f => f.status === 'loaded')
  .map(f => f.family);
// Compare to known families before injection → the delta is the new font
```
This handles Google Fonts reliably. For other CSS font services, the user may need to manually specify the family name.

## Phase 2: Save/Export Integration

**Generated `.ts` theme file** — Include URLs:
```ts
export const oceanBreezeTheme: ThemeConfig = {
  // ...
  fonts: {
    display: '"Playfair Display", Georgia, serif',
    displayUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap',
    sans: 'Recursive, system-ui, sans-serif',
    mono: 'Recursive, system-ui, sans-serif',
  },
};
```

**`ThemeProvider.tsx`** — On theme load, call `syncCssVars` which now handles `<link>` injection. Fonts load automatically when the theme is activated.

## Phase 3: Polish

- Persist loaded font URLs in `localStorage` so they survive refresh during a ThemeLab session
- Add a "Popular Fonts" quick-picker (curated list of Google Fonts URLs)
- Handle offline/failed font loads gracefully (fall back to the font-family's system fallback)
- Consider preconnect hints for Google Fonts: `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`

## Risks & Mitigations
- **FOUT (flash of unstyled text)**: Google Fonts uses `display=swap` by default, so text renders immediately with fallback then swaps. Acceptable for a theming tool.
- **CORS**: Google Fonts and most font CDNs serve with permissive CORS headers. Self-hosted font CSS may require the user to ensure CORS is configured.
- **Bundle size**: Zero impact — fonts are loaded at runtime via `<link>`, not bundled.
- **Type safety**: The new `*Url` fields are optional, so existing themes work unchanged.

## Files to Modify
1. `src/themes/types.ts` — Add `displayUrl?`, `sansUrl?`, `monoUrl?` to `ThemeFonts`
2. `src/themes/syncCssVars.ts` — Add `syncFontLink` helper, call from `syncCssVars`
3. `src/ThemeLab.tsx` — Add URL input UI below each FontSelect, detection logic
4. `src/themes/playground.ts` — No changes needed (URLs default to undefined)
5. `src/themes/cyprus.ts` — No changes needed
