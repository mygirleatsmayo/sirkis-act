# CLAUDE.md — sirkis-act

> Interactive retirement and savings financial planning tool. Users model 401(k)/403(b), Roth IRA, and HSA contributions with employer match, delayed-start comparisons, inflation-adjusted projections, withdrawal modeling through life expectancy, and salary presets by college major.

---

## Project Quick Reference

- **Stack:** React 19 + TypeScript 5.7 (strict) + Vite 6 + Tailwind CSS 3.4 + Recharts 3.7
- **Deployed to:** GitHub Pages at `https://mygirleatsmayo.github.io/sirkis-act/`
- **CI/CD:** GitHub Actions (`.github/`)

### Commands

```
npm run dev        # local dev server
npm run build      # tsc && vite build
npm run lint       # eslint (ts,tsx, zero warnings)
npm run preview    # preview production build
```

### Source Structure

```
src/
  App.tsx          # main application logic, UI, salary presets
  index.css        # global Tailwind styles
  main.tsx         # React entry point
  vite-env.d.ts    # Vite type declarations
```

### Key Config

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite config, `base: "/sirkis-act/"`, React plugin |
| `tsconfig.json` | ES2020 target, strict mode, `noUnusedLocals`, `noUnusedParameters` |
| `tailwind.config.js` | Tailwind content paths |
| `postcss.config.js` | PostCSS + Tailwind + Autoprefixer |

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
- **Recharts** for all chart/visualization work
- **Lucide React** for icons
- Keep `src/` flat unless component extraction is explicitly agreed upon
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

## 7. Git Branching Workflow

- **No `/` separators** in branch names; use hyphens instead (e.g., `ui-polish-2`, not `ui/polish-2`)
- **Sub-branches use `/`** off a namespace that is not itself a branch (e.g., `ui-polish-2/stats-panels`, `ui-polish-2/visual-identity`)
- **Tag checkpoints** before merging to `main` (e.g., `git tag ui-polish-checkpoint-feb15`)
- **Workflow**: work on sub-branches → merge to `main` when ready → tag before merge
- The namespace parent (e.g., `ui-polish-2`) should not exist as a branch; it's just a grouping prefix

---

## 8. Backup Safety

Before making significant changes:
- Check when the last git commit was made
- If there are uncommitted changes that could be lost, **ask user** before proceeding
- Let user decide whether to commit or stash first
