# Styling consolidation tooling — DEV-491

Consolidates `styled-components` to Tailwind utility classes via a codemod
guarded by Playwright visual regression.

## Prereqs

```bash
# 1. Install Playwright browsers (one-time)
npx playwright install chromium

# 2. Start the dev server in another terminal
npm run start

# 3. (For auth-walled routes) Generate storage state once.
#    Credentials live in .env.local (gitignored) as VR_COMPANY_EMAIL/PASSWORD.
npm run vr:auth
```

## Per-target workflow

Pick a directory, then run one cycle per directory.

```bash
# 1. Capture "before" — only routes touched by this target
npx tsx --env-file=.env.local scripts/migrate-cycle.ts \
  --target=src/components/Home \
  --baseline-only

# 2. Run the codemod (dry run first to see the plan)
npm run migrate:codemod -- --target=src/components/Home

# 3. Apply for real
npm run migrate:codemod -- --target=src/components/Home --write

# 4. Capture "after", diff, render report
npx tsx --env-file=.env.local scripts/migrate-cycle.ts \
  --target=src/components/Home \
  --verify-only
```

Or do all four in one shot:

```bash
npm run migrate:cycle -- --target=src/components/Home
```

The orchestrator runs: baseline → codemod (with --write) → current → diff → report.

## What the codemod does

For each `*.tsx` file under the target:

- Finds every `const X = styled.<htmlTag>\`...\`;` declaration
- Parses the CSS, maps each property/value to Tailwind classes using
  `tailwind.config.js` as the source of truth (project's custom colors,
  fonts, etc. are honored)
- Maps `&:hover`, `&:focus`, `&::before`, etc. to Tailwind variant prefixes
- Rewrites every JSX usage `<X foo />` → `<htmlTag className="..." foo />`
- Removes the now-unused styled declaration
- Drops the `styled` default import when nothing else uses it

## What the codemod does NOT do (left for human review)

The codemod is conservative — anything below is **left intact** with a TODO
in the report (`scripts/migrate-styles/last-run.json`):

- `${prop => ...}` interpolations (dynamic styles)
- `styled(Component)\`...\`` (wrapping another component)
- `styled.div.attrs(...)` (with .attrs)
- Descendant selectors `& > div`, `& .child`
- `@media` queries (use Tailwind responsive prefixes manually)
- Unmapped CSS properties (transform, box-shadow, gradient backgrounds, etc.)

The visual regression report is the safety net for everything that *did*
get auto-migrated.

## Reviewing a cycle

After `migrate:cycle`, open:

```
scripts/visual-regression/snapshots/diff/report.html
```

Side-by-side baseline / current / pixel diff for every affected route. If a
route shows expected differences only (e.g. minor anti-aliasing), bump the
threshold via `--threshold=0.005` in the diff step and accept. If something
real regressed, fix the .tsx and re-run `migrate:cycle --verify-only`.

## Manifest

Routes captured live in `scripts/visual-regression/manifest.ts`. Each entry
declares `sourceGlobs` so the runner can pick only the routes touched by a
given target. Add new routes here.
