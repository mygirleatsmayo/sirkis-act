# Feral Filly + Overheated Rhizome — Current Design Decisions

**Date:** 2026-03-13  
**Branch:** `new-themes`  
**Status:** In Progress

---

## Overview

This document captures the current design state for the two new theme forks in progress:

- **Feral Filly Feline Financial**
- **Overheated Rhizome**

Both are intended as forks of Cyprus rather than new architectural variants. The expected differences are:

- palette,
- logo,
- fonts,
- minor branding copy,
- hero/tagline/subhead tone.

They should feel fully authored and distinctive, not like thin token swaps or generic theme skins.

---

## Shared Constraints

- Keep the existing `ThemeConfig` contract intact.
- Preserve the current app structure and layout behavior.
- Avoid “AI slop” aesthetics; every decision should feel specific and intentional.
- Treat Cyprus as the runtime/mechanical base, not the visual reference for final identity.
- Theme work should primarily change:
  - colors,
  - branding content,
  - logo,
  - typography,
  - small copy details.

---

## Feral Filly Feline Financial

### Core Direction

Feral Filly should feel like a playful, slightly unhinged, cat-forward financial identity built on **Catppuccin Macchiato**, but still readable as a serious planning tool.

The target balance is:

- playful,
- pink-forward,
- decorative,
- characterful,
- but not childish or unserious.

The user explicitly wants it to lean more playful than some other themes.

### Locked Decisions

1. **Base palette direction:** Catppuccin Macchiato.
2. **Primary background reference:** `#24273A`.
3. **Primary brand color:** pink `#F5BDE6`.
4. **Display font:** **Bagnard**.
5. **Logo direction:** heraldic seated cat-griffin / cat-crest treatment.

### Current Color Direction

Current working palette:

- **Bg:** `#24273A`
- **Brand:** `#F5BDE6`
- **Brand Accent:** `#C6A0F6`
- **Growth:** `#EED49F`
- **Employer Funded:** `#A6DA95`
- **Loss:** `#ED8796`
- **Start Now:** `#8BD5CA`

This keeps the theme recognizably Macchiato while letting pink dominate the identity.

### Typography Decisions

- **Display:** Bagnard
  - Intended use: hero/headline identity, not dense UI text.
  - Weight reality: effectively one usable weight around `400`.
- **Sans / UI:** not locked yet.

Sans candidates discussed:

- Comfortaa
- Sour Gummy
- Recursive
- possibly other side-by-side comparisons if needed

### Branding / Logo Decisions

The user shared a clear logo direction:

- seated heraldic cat-griffin,
- decorative tail,
- botanical sprig,
- circular seal / border text feel.

Implementation expectation:

- user will handle final SVG export,
- placeholder can use an existing logo component until final art is ready.

### Copy State

Brand voice is not fully locked.

Current expectation:

- use placeholder Cyprus copy or cat-themed copy until final language is chosen,
- final copy should feel witty/playful rather than solemn,
- but still support trust and usability in a financial-planning context.

### Design Considerations

1. **Pink discipline matters.** Pink should lead the brand without washing out semantic chart colors.
2. **Bagnard must stay special-purpose.** It should carry identity, not burden smaller UI elements.
3. **The sans choice is still the main unresolved design lever.** It will determine whether the theme reads as elegant-weird, playful-cute, or novelty-heavy.
4. **The logo must feel authored, not mascot-generic.** Heraldic structure is important.
5. **Cat energy is the point, but the app still has to sell credibility.**

### Open Questions

- Which sans best complements Bagnard without turning the interface juvenile?
- Should hero copy stay close to Cyprus structure or become fully cat-specific?
- How decorative should the final logo ring / border text become?
- Does the final theme want stronger mauve/lilac support beyond the pink brand?

### Implementation Notes

- Self-host Bagnard as `woff2` in `src/fonts/`.
- Use a temporary placeholder logo until the final cat SVG exists.
- Keep semantic financial colors legible and distinct from pure brand styling.

---

## Overheated Rhizome

### Core Direction

Overheated Rhizome should feel **earthy, tuberous, academic, and slightly deranged**.

The design pivot was explicit: it needed to feel **“more potato.”**

The intended mood is:

- potato-skin darks,
- starchy cream lights,
- academic snark,
- root-vegetable grotesquerie,
- but still attractive and coherent.

### Locked Directional Choices

1. The theme should be unmistakably potato-rooted rather than abstract “earth tones.”
2. The palette explorer exists to compare dark/light variants and typography pairings.
3. Semantic chart colors must make financial sense, especially in light mode.

### Palette Exploration State

The palette explorer currently contains:

- **4 dark variants**
- **4 light Round 2 variants** with semantic correction
- **4 light Round 1 variants** kept as reference only

Dark variant names:

- Scorched Earth
- Root Cellar
- Night Shade
- Starchy Interior

No final winning palette has been selected yet.

### Semantic Color Rules for Light Round 2

Round 2 was created specifically to fix semantic confusion in the earlier light pass.

Current working rules:

1. **Growth** should read as positive immediately.
   - Usually forest green.
   - Exception: if the brand itself is green, Growth can shift to coin-gold to avoid collision.
2. **Loss** should remain clearly red/crimson.
3. **Employer Funded** should be distinct from Growth.
   - Violet, berry, or teal-blue are valid depending on the palette.
4. **Start Now** should also remain clearly positive and non-muddy.
   - Deep teal, slate blue, or violet are acceptable.

### Current Color Families in Play

The main palette families under consideration are:

- **Amber / baked orange**
- **Sprout green**
- **Wine / magenta**
- **Pale gold / starch cream**

The page background used for palette comparison was intentionally set to a neutral gray so surrounding color would not bias selection.

### Typography Exploration

Four pairings were compared in the palette explorer:

1. **Spectral + Space Grotesk + Space Mono**
2. Playfair Display + IBM Plex Sans + IBM Plex Mono
3. DM Serif Display + DM Sans + IBM Plex Mono
4. Libre Baskerville + Work Sans + Space Mono

Current recommendation / leading option:

- **Spectral + Space Grotesk + Space Mono**

Reason:

- it feels literary and academic,
- it supports the slightly absurd concept without collapsing into parody,
- it works across both dark and light directions.

### Copy / Tone State

The current tone is intentionally weird and academic-snarky.

Examples used during exploration include lines like:

- “the potato at peak internal temperature”
- “those who put the diss in dissertation”

This theme is allowed to be more absurd than Cyprus, but the absurdity still needs to feel designed rather than random.

### Logo / Branding State

No final logo is locked yet.

Open territory includes whether the identity should stay mostly typographic or whether it wants a more specific emblematic mark.

### Design Considerations

1. **“Potato” is the actual brief, not just metaphor.** Avoid drifting back toward generic earthy-modern branding.
2. **The theme needs semantic rigor.** Strange branding is fine; ambiguous chart semantics are not.
3. **Typography does a lot of the tone work here.** The wrong pair will make the concept collapse into joke-shop styling.
4. **Light mode needs especially careful contrast and role clarity.**
5. **Magenta / wine is interesting but must be controlled.** It can become nightclub instead of dissertation-root-cellar if pushed too far.

### Open Questions

- Which palette actually wins: dark or light, and which named variant?
- Does the final theme lean more amber, more green, more wine, or more pale-starch?
- Is the identity primarily typographic, or does it want a specific logo/emblem?
- How far should the copy go into academic derangement before it stops feeling usable?

### Implementation Notes

- The explorer is currently the working source of truth for palette comparison.
- Once a palette is selected, theme tokens should be translated cleanly into a `ThemeConfig` fork.
- The chosen font stack should then be self-hosted or mapped into the app’s font system as needed.

---

## Current Recommendation Snapshot

### Feral Filly

- Keep Catppuccin Macchiato.
- Keep pink as dominant brand signal.
- Keep Bagnard as display.
- Next critical decision: lock the UI sans.

### Overheated Rhizome

- Keep the potato-first concept.
- Keep semantic light-mode corrections from Round 2.
- Leading font pairing remains Spectral + Space Grotesk + Space Mono.
- Next critical decision: choose the winning palette family and mode.

---

## Next Steps

1. Build a dedicated Feral Filly font/palette comparison view if needed for the sans decision.
2. Choose the winning Overheated Rhizome palette variant.
3. Lock hero/tagline copy direction for each theme.
4. Move each theme from design state into implementation files under `src/themes/`.