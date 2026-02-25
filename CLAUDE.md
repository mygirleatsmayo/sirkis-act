# CLAUDE.md — sirkis-act

> Interactive retirement and savings financial planning tool. Users model 401(k)/403(b), Roth IRA, and HSA contributions with employer match, delayed-start comparisons, inflation-adjusted projections, withdrawal modeling through life expectancy, and salary presets by college major.

---

## Project Quick Reference

- **Stack:** React 19 + TypeScript 5.7 (strict) + Vite 6 + Tailwind CSS 3.4 + Recharts 3.7 + Vaul (drawer) + DOMPurify + Vitest
- **Deployed to:** GitHub Pages at `https://mygirleatsmayo.github.io/sirkis-act/`
- **CI/CD:** GitHub Actions (`.github/`)
- **Current version:** 1.0.0 (tagged 2026-02-24)

### Commands

```
npm run dev        # local dev server
npm run build      # tsc -b && vite build (project references)
npm run lint       # eslint (ts,tsx, zero warnings)
npm run test       # vitest run (all tests, single pass)
npm run preview    # preview production build
```

### Source Structure

```
src/
  App.tsx              # main component (~1,100 lines): helper components, state, layout, chart/table
  Root.tsx             # wraps App + ThemeLab + FAB toggle in ThemeProvider
  ThemeLab.tsx         # floating theme editor panel (SVG upload sanitized via DOMPurify)
  constants.ts         # DEFAULT_INPUTS, LIMITS (IRS caps), SIRKISMS, INPUT_BOUNDS
  types.ts             # all TypeScript interfaces and type aliases
  index.css            # global Tailwind styles, @font-face declarations
  main.tsx             # React entry point (renders Root)
  vite-env.d.ts        # Vite type declarations
  components/
    CrownLogo.tsx      # SVG crown logo component (referenced by themes)
  themes/
    types.ts           # ThemeConfig, ThemeColors, ThemeBranding, ThemeFonts, ThemeEffects
    cyprus.ts          # default theme definition
    playground.ts      # ThemeLab working copy (deep clone of Cyprus)
    index.ts           # theme registry, getTheme(), defaultThemeId
    ThemeProvider.tsx   # context provider, localStorage persistence, override support
    ThemeContext.ts     # React context definition
    useTheme.ts         # useTheme() hook
    syncCssVars.ts      # syncs ThemeConfig → CSS custom properties
  utils/
    format.ts          # formatCurrency, formatCompact, getLossFractionLabel, clampNumber, hexAlpha
    projection.ts      # runProjection() — core financial engine
  __tests__/
    constants.test.ts  # LIMITS and DEFAULT_INPUTS validation
    format.test.ts     # formatCurrency, formatCompact edge cases
    projection.test.ts # IRS cap clamping, employer match, inflation, delayed vs. immediate
  fonts/               # self-hosted variable woff2 (Fraunces display, Recursive Sans Linear UI)
```

### Key Config

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite config, `base: "/sirkis-act/"`, React plugin |
| `tsconfig.json` | Root config with project references (app + node) |
| `tsconfig.app.json` | App source: ES2020 target, strict mode, excludes tests |
| `tsconfig.node.json` | Vite config: composite, noEmit |
| `tailwind.config.js` | Tailwind content paths, `fontFamily.display` (Fraunces), `fontFamily.sans` (Recursive) |
| `postcss.config.js` | PostCSS + Tailwind + Autoprefixer |
| `eslint.config.js` | ESLint v9 flat config with TypeScript + React |
| `AGENTS.md` | Warp agent guidance (architecture, conventions, commands) |
| `AUDIT.md` | 43-finding codebase audit for agent reference |

---

## 1. Communication & Modification Policy

- **Concise, bulleted, step-by-step** responses; lead with recommended approach only
- Understand **WHY** before proposing solutions; ask if motivation is unclear
- **NEVER modify/create/delete files** without explicit, current user confirmation for that specific action
  - "Implied" permission from previous conversation context is **not valid**
  - Ask "Shall I proceed with editing [filename]?" and wait for a clear yes
- When providing copyable output (commands, paths, code), wrap each item in its own code block
- Lead with the recommended approach; only mention alternatives if the user asks
- Include all prerequisite steps upfront (don't reveal them one at a time after failures)

---

## 2. Coding Conventions

- **TypeScript strict mode** is enforced; do not use `any` or suppress type errors without justification
- **Zero lint warnings** policy; run `npm run lint` before considering work complete
- **Tailwind CSS** for all styling; avoid inline styles or separate CSS files unless necessary
- **Recharts** for all chart/visualization work; **Lucide React** for icons; **Vaul** for mobile drawer
- Extracted modules exist (`constants.ts`, `types.ts`, `utils/`), but keep `src/` flat unless further extraction is explicitly agreed upon
- Unused variables prefixed with `_` (ESLint rule: `argsIgnorePattern: "^_"`)
- Avoid over-engineering; only make changes that are directly requested or clearly necessary
- Do not add docstrings, comments, or type annotations to code you did not change
- **No orphan words** in headlines, subheadlines, labels, and short UI text; use `whitespace-nowrap` on the last 2–3 words or equivalent

---

## 3. Memory MCP Usage

Use Memory MCP **without asking permission**.

- At session start, update the `current_date_awareness` entity
- Store: stable preferences, project architecture decisions, build/lint commands, reusable workflows
- Do not store: ephemeral errors, secrets/credentials, transient experiments
- Write as small, atomic observations
- **Notify user** every time something is written or updated
- If user corrects a memory, update or delete it and confirm

---

## 4. Research Guidelines (MCP Priority)

### Tier 1: Primary (equal priority)
- **Exa** — code examples, implementations, patterns (`get_code_context_exa` first, then `web_search_exa`)
- **Ref** — official docs, API references, exact signatures (`ref_search_documentation` + `ref_read_url`)

### Tier 2: Specialized
- **Context7** — library internals, specific API usage (max 3 calls per question)
- **Apify** — web scraping, data extraction
- **Supabase MCP** — Supabase-specific docs and project management

### Tier 3: Fallback (notify user before calling)
- **Perplexity** — complex multi-layered questions, or when Tier 1 fails
- **Brave Search** — last resort, or when Perplexity fails

**Decision logic:** "how to implement X" or "show me examples" → Exa. "Official docs for X" or "exact API params" → Ref. Use both when validating examples against docs.

---

## 5. Sequential Thinking MCP

Use automatically for:
- Multi-step, open-ended tasks (planning, architecture, complex debugging)
- Situations where earlier reasoning may need revision
- When user explicitly wants to see reasoning or options

**Avoid** for: simple local edits, factual lookups, single-file non-architectural refactors.

---

## 6. Session Awareness

### Before Starting Work
1. Read `SESSION_LOG.md` at project root to understand prior sessions, files changed, and pending next steps
2. Update Memory MCP `current_date_awareness` entity
3. Query Memory MCP for project-specific context

### When to Update SESSION_LOG.md

| Trigger | Action |
|---------|--------|
| Major task completion | Add checkpoint entry |
| 24h+ resume | Log what was done before continuing |
| Explicit request | User requests checkpoint or update |
| Session end | Full closeout entry |

### Session Entry Format

Prepend newest first:

```markdown
## Session N: [Title]

**Date:** YYYY-MM-DD

### What Was Done
- [Bullet list]

### Files Changed
| File | Action |
|------|--------|
| `path/to/file` | Created/Modified/Deleted |

### Known Issues / Snags
| Issue | Description | Priority |

### Next Steps
1. [Action items for next session]
```

---

## 7. Git Branching & Worktrees

### Branch Naming
- **No `/` separators** in branch names; use hyphens instead (e.g., `ui-polish-2`, not `ui/polish-2`)
- **Sub-branches use `/`** off a namespace that is not itself a branch (e.g., `ui-polish-2/stats-panels`, `ui-polish-2/visual-identity`)
- **Tag checkpoints** before merging to `main` (e.g., `git tag ui-polish-checkpoint-feb15`)
- **Workflow**: work on sub-branches → merge to `main` when ready → tag before merge
- The namespace parent (e.g., `ui-polish-2`) should not exist as a branch; it's just a grouping prefix

### Worktrees
Use git worktrees for parallel isolated work. See `~/.claude/rules/worktrees.md` for full conventions.

- **Directory naming**: `<project>--<purpose>` sibling dirs (e.g., `sirkis-act--themes`, `sirkis-act--oz`)
- **Theme work**: always in its own worktree (`sirkis-act--themes`)
- **Agent work** (Oz): always in its own worktree (`sirkis-act--oz`)
- **Visual A/B**: run two dev servers on different ports for side-by-side comparison of undeployed branches
- Each worktree needs its own `npm install`
- Remove worktrees when done (`git worktree remove`)

---

## 8. Backup Safety

Before making significant changes:
- Check when the last git commit was made
- If there are uncommitted changes that could be lost, **ask user** before proceeding
- Let user decide whether to commit or stash first
