# Visual Regression Migration Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing React/Tailwind screenshot harness into a deterministic, fail-closed pixel-parity gate for each Next App Router migration cluster.

**Architecture:** The route contract owns URLs; the visual manifest adds screenshot-specific readiness, auth, viewport, mask, and cluster metadata. Approved baselines are read-only and may live outside the worktree, while every run writes a self-contained artifact directory. Capture, diff, and report have unit-tested pure cores, and a verifier always renders a report while preserving capture/diff failure status.

**Tech Stack:** Playwright 1.59, TypeScript 5.5, Vitest 3, PNGJS, pixelmatch

---

### Task 1: Make the visual manifest a validated view of the route contract

**Files:**
- Modify: `scripts/visual-regression/manifest.ts`
- Create: `scripts/visual-regression/manifest.test.ts`
- Modify: `scripts/visual-regression/capture.ts`
- Modify: `scripts/visual-regression/diff.ts`

- [ ] **Step 1: Write failing manifest integrity and selection tests**

Create table-driven tests proving: IDs and `(path, auth)` state pairs are
unique; every visual path exists in `applicationRoutes`; all cluster and
viewport names are valid; the same URL may intentionally have anonymous and
authenticated entries with different IDs; non-blocking and missing baseline
policies require a reason; readiness selectors, source globs, mask reasons,
and broken-image exemptions are non-empty; unknown baseline policy kinds and
duplicate cluster/viewport names are rejected; and the current 14 baseline IDs
plus their exact path/auth mappings are preserved.

Test the pure `VisualSelection` object, not CLI parsing. Prove filters use OR
within one kind and AND across kinds, preserve manifest and viewport order,
reject unknown or empty filter values, reject an empty final selection, and
make target matching respect exact path boundaries so
`src/components/Home` does not match `src/components/HomeFoo`. The temporary
`entriesForTarget` compatibility wrapper must return one entry per route even
when an entry later owns multiple viewport cases.

- [ ] **Step 2: Run and verify RED**

Run: `PATH=/Users/chrisknuteson/.nvm/versions/node/v22.22.0/bin:$PATH npx vitest run scripts/visual-regression/manifest.test.ts`

Expected: FAIL because the current manifest has no cluster/viewport selection
API, no baseline disposition, and `entriesForTarget` has an over-broad prefix
branch.

- [ ] **Step 3: Implement the explicit manifest schema**

```ts
export type AuthState = 'admin' | 'anonymous' | 'company' | 'individual';
export type RouteCluster =
  | 'account-auth'
  | 'admin'
  | 'matches'
  | 'messages'
  | 'profile-production'
  | 'public-data'
  | 'public-static'
  | 'shell';
export type ViewportName = 'desktop' | 'mobile';

export type BaselinePolicy =
  | { kind: 'blocking-candidate' }
  | { kind: 'reference-only'; reason: string }
  | { kind: 'missing'; reason: string };

export interface RouteEntry {
  id: string;
  path: ApplicationPath;
  auth: AuthState;
  baselinePolicy: BaselinePolicy;
  clusters: RouteCluster[];
  readiness: {
    visible: string[];
    hidden?: string[];
  };
  fullPage: boolean;
  viewports: ViewportName[];
  masks?: Array<{ reason: string; selector: string }>;
  allowBrokenImages?: string[];
  sourceGlobs: string[];
}

export interface VisualSelection {
  clusters?: RouteCluster[];
  ids?: string[];
  target?: string;
  viewports?: ViewportName[];
}

export interface VisualCase {
  entry: RouteEntry;
  viewport: ViewportName;
}
```

Set desktop to `1440x900` and mobile to `390x844`, both device scale factor 1.
Keep exactly the current 14 IDs and baseline directory names in this task.
Define cluster membership explicitly:

- `home`: `public-static`, `shell`
- `faq`, `donate`, `about-us`, `theatre-resources`: `public-static`
- `events`, `shows`, `get-involved`: `public-data`
- `login`, `signup`, `forgot-password`: `account-auth`
- `company-profile`: `profile-production`, `shell`
- `company-messages`: `messages`
- `company-roles-search`: `matches`

Use `blocking-candidate` only for `donate`, `faq`, `about-us`, `login`,
`signup`, and `forgot-password`. Mark `home` and `theatre-resources`
reference-only until their live cross-origin iframes are normalized. Mark all
live-data and authenticated entries reference-only with precise reasons. No
mobile case is blocking until a compatibility baseline exists.

Export `selectVisualCases(manifest, selection)` so viewport filtering is
represented explicitly. Adapt `capture.ts` and `diff.ts` mechanically in this
same task to consume `id`, named viewports, `anonymous`, the readiness arrays,
and `selectVisualCases` without yet changing their soft-failure behavior. This
keeps the existing harness runnable between commits. Validate the manifest at
module construction and leave CLI parsing for Task 2.

- [ ] **Step 4: Run and verify GREEN**

Run the focused test and focused ESLint over all four changed files; expect both
to pass. Run the full Vitest suite. Verify SHA-256 hashes under the external
baseline corpus are unchanged.

- [ ] **Step 5: Commit**

```bash
git add scripts/visual-regression/manifest.ts scripts/visual-regression/manifest.test.ts scripts/visual-regression/capture.ts scripts/visual-regression/diff.ts
git commit -m '[DEV-511] Validate visual migration routes'
```

### Task 2: Separate read-only baselines from writable artifacts

**Files:**
- Create: `scripts/visual-regression/config.ts`
- Create: `scripts/visual-regression/config.test.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Write failing path and CLI tests**

Test these environment variables and flags:

```text
VR_BASE_URL=http://127.0.0.1:3000
VR_BASELINE_DIR=/absolute/read-only/baseline
VR_ARTIFACT_DIR=/absolute/writable/run
VR_AUTH_DIR=/absolute/ignored/auth
--cluster=public-static,account-auth
--only=home,faq
--target=src/components/Home
--viewport=desktop,mobile
--threshold=0.001
```

Assert defaults resolve under `scripts/visual-regression`, relative paths are
made absolute, and all baseline/artifact/auth overlaps are rejected in either
direction after resolving symlink/case aliases through existing paths or their
nearest existing ancestor. Threshold must satisfy `0 <= value < 1`; unknown
flags fail; and capture cannot select the `baseline` bucket unless the caller
explicitly chooses the baseline command.

Reject base URLs with credentials, query, fragment, or a non-root path, and
normalize repeated trailing slashes. Trim environment path values before path
resolution. Normalize `--target` as a repository-relative source path, collapse
`.`/`..`, and reject absolute targets or any path escaping the repository so a
nonempty but wrong visual selection cannot silently omit the intended route.

- [ ] **Step 2: Run and verify RED**

Run: `PATH=/Users/chrisknuteson/.nvm/versions/node/v22.22.0/bin:$PATH npx vitest run scripts/visual-regression/config.test.ts`

Expected: FAIL because the shared config module does not exist.

- [ ] **Step 3: Implement shared configuration**

Export `parseVisualArgs(argv, command)`, `resolveVisualPaths(environment, cwd)`,
and `resolveVisualSelection(args, manifest, cwd)`. `command` is a typed entrypoint
mode (`baseline`, `capture`, `diff`, `report`, or `verify`), not a user-settable
flag. Only `baseline` mode may resolve the baseline output bucket; reject
`--bucket=baseline` from every other mode so an ordinary capture cannot mutate
approved evidence. Return paths shaped as:

```ts
interface VisualPaths {
  artifactDir: string;
  authDir: string;
  baselineDir: string;
  captureSummary: string;
  currentDir: string;
  diffDir: string;
  reportFile: string;
  summaryFile: string;
}
```

Add `scripts/visual-regression/artifacts/` to `.gitignore`. Do not change or
copy the user's existing snapshot corpus.

- [ ] **Step 4: Run and verify GREEN**

Run the focused config test; expect all cases to pass.

- [ ] **Step 5: Commit**

```bash
git add .gitignore scripts/visual-regression/config.ts scripts/visual-regression/config.test.ts
git commit -m '[DEV-511] Isolate visual regression artifacts'
```

### Task 3: Replace soft sleeps and swallowed capture errors with a stability gate

**Files:**
- Create: `scripts/visual-regression/stability.ts`
- Create: `scripts/visual-regression/stability.test.ts`
- Create: `scripts/visual-regression/capture-core.ts`
- Create: `scripts/visual-regression/capture-core.test.ts`
- Modify: `scripts/visual-regression/capture.ts`
- Modify: `scripts/visual-regression/manifest.ts`
- Modify: `scripts/visual-regression/manifest.test.ts`
- Modify: `scripts/visual-regression/calibrate.ts`
- Modify: `scripts/visual-regression/calibrate.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write failing readiness validation and capture-failure tests**

Use `// @vitest-environment node` and a sequential Playwright fixture built with
`page.setContent()` plus route fulfillment. Include a delayed unique ready
marker, later-hidden loading marker, controlled WOFF2, valid and broken images,
CSS animation, interval-driven state, a mask target, and an iframe. Prove
readiness and font loading are awaited; missing visible/never-hidden readiness,
failed declared font, unapproved broken image, stale exemption, and missing or
non-visible mask all fail; animation is disabled; interval state stops; and an
approved broken image is reported.

Unit-test a pure capture runner that receives selected cases plus a `captureOne`
dependency. A thrown first case must not prevent a successful second case; both
outcomes appear in a failed summary and only the successful case names an
artifact. Importing `capture.ts` is not a unit-test seam because it executes its
CLI entrypoint.

- [ ] **Step 2: Run and verify RED**

Run: `PATH=/Users/chrisknuteson/.nvm/versions/node/v22.22.0/bin:$PATH npx vitest run scripts/visual-regression/stability.test.ts`

Expected: FAIL because fixed sleeps, generic `main` readiness, swallowed errors,
and side-effectful CLI orchestration are the only current behavior.

- [ ] **Step 3: Implement `stabilizePage`**

```ts
export interface StabilityResult {
  durationMs: number;
  fonts: Array<{
    family: string;
    status: FontFaceLoadStatus;
    style: string;
    weight: string;
  }>;
  frames: Array<{ crossOrigin: boolean; src: string; visible: boolean }>;
  images: {
    checked: number;
    exemptedBroken: Array<{
      reason: string;
      selector: string;
      url: string;
    }>;
  };
  intervalsCleared: number;
  masks: Array<{
    matchCount: number;
    reason: string;
    selector: string;
    visibleCount: number;
  }>;
}

export interface StabilizedPage {
  maskLocators: Locator[];
  result: StabilityResult;
}
```

Create contexts with reduced motion, blocked service workers, deterministic
locale/time zone/color scheme, and the selected viewport. Before navigation,
install interval tracking and a request policy covering all frames. Silently
block Analytics/Tag Manager, Givebutter display traffic, and Firebase
Installations/Analytics registration. Abort, record, and fail known mutation
attempts: Firestore `Write/channel`, `:commit`, `:batchWrite`; Storage
upload/update/delete; and non-idempotent Givebutter/Zeffy/LGL calls. Do not block
all POSTs because Firestore reads/listeners and token refreshes may use them.

Use `domcontentloaded`, assert the final pathname still equals the manifest
path, inject CSS disabling animation/transition/caret/scroll behavior, and wait
for exact semantic readiness selectors. Replace generic `main` selectors with
route-specific heading/form selectors. Authenticated identity readiness remains
reference-only until Task 5.

After readiness, clear tracked intervals so Home/Donate JavaScript carousels
cannot advance. Await `document.fonts.ready`, enumerate declared FontFace
records, fail any in `error`, and record loaded metadata. Do not hard-code Open
Sans/Lora/Montserrat checks: the compatibility host does not currently load the
legacy Google-font link, and `document.fonts.check` can succeed via fallback.

Change broken-image exemptions to accountable
`{ selector: string; reason: string }` entries. Check every non-empty `img[src]`,
including hidden responsive images, after eager loading and bottom/top scroll.
Loaded means complete with positive natural dimensions. Every exemption must
match a currently broken image; redact query/fragment data in summaries. CSS
background-image validation is deferred.

Every mask must be syntactically valid, match an attached element, and have at
least one visible match. Record total/visible counts and pass its locator to the
screenshot. Record iframe visibility and cross-origin status without inspecting
cross-origin contents. A blocking candidate with a visible cross-origin iframe
fails; reference-only Home/resources may capture with diagnostics until Task 6
normalizes frames.

Await two animation frames, screenshot to a partial file, and rename only after
success. `capture-core.ts` writes a versioned, portable `capture-summary.json`
atomically even when preflight, browser launch, auth loading, stability, or
screenshot fails. Include command, selection, redacted base URL, timestamps,
browser/Node/OS metadata, totals, and one per-case result with auth/path/final
URL, stability/request diagnostics, relative POSIX artifact path, and sanitized
error name/message. Never store stacks or unredacted query strings. Only a
successful case names an artifact; a failed case cannot reuse a stale PNG. The
core returns failure, while the CLI sets `process.exitCode = 1` after writing
the summary. Remove the unconditional 1500ms sleep and swallowed capture errors.

Make baseline authority explicit at the process entrypoint. Require one leading
command (`capture.ts baseline` or `capture.ts capture`), remove it before
calling `parseVisualArgs`, and reject any other or missing command. Update
package scripts so `vr:baseline` invokes the baseline entrypoint and
`vr:capture` invokes the ordinary capture entrypoint; do not infer baseline
authority from a user-provided `--bucket` flag. A temporary `vr:current` alias
may point to the same safe capture entrypoint until Task 5 finalizes script names.

- [ ] **Step 4: Run focused tests and a one-route capture GREEN**

Run both focused suites, then capture `/home` against a local compatibility host
with external artifact paths. Because Home is reference-only with a visible
cross-origin iframe, expect a successful image plus explicit frame diagnostics,
not promotion to a blocking gate. Chromium fixture execution may require the
approved unsandboxed local Playwright capability.

- [ ] **Step 5: Commit**

```bash
git add package.json scripts/visual-regression/stability.ts scripts/visual-regression/stability.test.ts scripts/visual-regression/capture-core.ts scripts/visual-regression/capture-core.test.ts scripts/visual-regression/capture.ts scripts/visual-regression/manifest.ts scripts/visual-regression/manifest.test.ts
git commit -m '[DEV-511] Make visual captures deterministic'
```

### Task 4: Make diff and report results self-contained and trustworthy

**Files:**
- Create: `scripts/visual-regression/diff-core.ts`
- Create: `scripts/visual-regression/diff-core.test.ts`
- Modify: `scripts/visual-regression/diff.ts`
- Create: `scripts/visual-regression/report.test.ts`
- Modify: `scripts/visual-regression/report.ts`
- Modify: `scripts/visual-regression/config.ts`
- Modify: `scripts/visual-regression/config.test.ts`

- [ ] **Step 1: Write failing pure diff and report tests**

Cover identical one-pixel images; changed images below and above threshold;
equality at the threshold; dimension padding; missing, invalid, and read-error
baseline/current independently and simultaneously; deterministic continuation
after a bad first case; and exact policy behavior for blocking-candidate,
reference-only, and missing states.

Validate the exported `CaptureSummaryV1` before reading any image. Require
schema version 1, command `capture`, current output bucket, matching totals,
unique ordered `(id, viewport)` keys, and exact current-manifest identity
including path/auth/policy. A passed capture has exactly one normalized POSIX
`current/<id>/<viewport>.png`; a failed capture has no artifact. Reject
absolute, backslash, traversal, duplicate, stale-policy/path, wrong-command,
unknown-version, and totals-drift summaries. Preserve failed capture cases as
`capture-failed` rows and never consume a stale PNG. Preflight every selected
baseline even when capture failed.

Report tests cover deterministic failure-first ordering, complete text and
attribute escaping (`& < > " '`), missing-asset placeholders, distinct
changed-under-threshold styling, a restrictive no-network CSP, no scripts or
absolute paths, and byte-identical pure output for identical input.

- [ ] **Step 2: Run and verify RED**

Run: `PATH=/Users/chrisknuteson/.nvm/versions/node/v22.22.0/bin:$PATH npx vitest run scripts/visual-regression/diff-core.test.ts scripts/visual-regression/report.test.ts`

Expected: FAIL because diff helpers are private, missing files report a zero
ratio without a verdict, paths are absolute, and report escaping omits quotes.

- [ ] **Step 3: Implement the pure cores and fail-closed orchestration**

Implement a filesystem-free comparison core:

```ts
comparePngCase({
  baselineBytes,
  captureResult,
  currentBytes,
  maxDiffRatio,
  pixelSensitivity,
  visualCase
}): { diffPng?: Buffer; result: DiffResult }
```

Decode both images, retain their original dimensions, pad to maximum width and
height, set total pixels to that padded area, and compare exact ratios. Equality
at `maxDiffRatio` passes; round only for display. Any dimension mismatch is a
factual failure even when padded pixel ratio is below threshold, but still
emits a diff PNG. Only ENOENT is missing; decode, zero dimensions, permission,
and other I/O faults become explicit issues and do not abort later cases.

Model baseline/current states separately as valid, missing, invalid, or
read-error; model comparison as identical, changed, or not-run; retain all
simultaneous issues. Every result includes the case identity/policy, original
dimensions, `dimensionsMatch`, total/diff pixels, exact ratio or null,
`verdict: pass|fail`, and `gateVerdict: pass|fail|not-enforced`.

Policy semantics are exact:

- `blocking-candidate` enforces pixel, dimension, and evidence verdicts.
- `reference-only` computes the same factual result, but pixel/dimension changes
  are `not-enforced`; evidence-integrity faults still block.
- `missing` is a blocking coverage failure and never passes. If a file appears
  while policy remains missing, report `unexpected-baseline` and fail; filesystem
  presence cannot promote authority.

Missing/invalid/read-error current or baseline, capture failure, malformed
summary, and manifest drift are evidence-integrity faults regardless of policy.
Current entries remain desktop-only with one route-level policy; mixed-policy
viewports are prohibited until Task 6 moves policy to visual-case granularity
before adding mobile.

`runDiff` consumes the exact validated capture matrix in order; it never
independently reselects routes from the manifest. Write `DiffSummaryV1` with
embedded capture run metadata, fixed pixel sensitivity, max ratio, run errors,
totals, overall gate verdict, and results in capture order. It returns summary
plus exit code and never exits.

Build a fresh staged `diff/report-assets/{baseline,current,diff}` tree. Copy
both valid baseline and current images and write diff PNGs using paths generated
from validated IDs/viewports, never untrusted summary strings. Summary paths are
relative POSIX paths rooted at `diffDir`; missing/invalid assets have no image
path. Atomically replace the asset tree and summary, eliminating stale prior
files. Even malformed input/preflight failure writes a current-run failure
summary so stale green evidence cannot survive.

Export pure `renderReport(summary)`. Its view sorts gate failures,
informational failures, changed-pass, then identical; uses explicit issue/ratio/
code-point ID/declared viewport tie breakers; and does not mutate JSON order.
Escape every text/attribute value, render placeholders instead of broken image
tags, use no locale-dependent formatting, and add CSP:
`default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline';
object-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'`.
The report CLI reads only the newly written summary and atomically writes HTML.

Tighten shared CLI parsing: `diff` accepts only threshold plus path environment;
`report` accepts no selection/threshold flags. `verify` later owns selection and
passes it to capture. Ignored user intent must be rejected, never silently
discarded.

- [ ] **Step 4: Run and verify GREEN**

Run focused tests. Then run diff/report against a deliberately missing baseline
and verify nonzero exit, a fresh failure summary, and a rendered placeholder
row. Copy `diffDir` elsewhere, remove the original baseline/current locations,
and prove the portable report assets remain complete.

- [ ] **Step 5: Commit**

```bash
git add scripts/visual-regression/config.ts scripts/visual-regression/config.test.ts scripts/visual-regression/diff-core.ts scripts/visual-regression/diff-core.test.ts scripts/visual-regression/diff.ts scripts/visual-regression/report.ts scripts/visual-regression/report.test.ts
git commit -m '[DEV-511] Harden visual diffs and reports'
```

### Task 5: Add strict auth-state and one-command verification

**Files:**
- Create: `scripts/visual-regression/auth-state.ts`
- Create: `scripts/visual-regression/auth-state.test.ts`
- Modify: `scripts/visual-regression/auth-setup.ts`
- Create: `scripts/visual-regression/auth-setup.test.ts`
- Modify: `scripts/visual-regression/capture.ts`
- Modify: `scripts/visual-regression/diff.ts`
- Modify: `scripts/visual-regression/report.ts`
- Create: `scripts/visual-regression/verify.ts`
- Create: `scripts/visual-regression/verify.test.ts`
- Create: `scripts/visual-regression/tsconfig.json`
- Modify: `package.json`

- [ ] **Step 1: Write failing orchestration/auth contract tests**

Assert auth setup is import-safe, dependency-injected, uses `VR_AUTH_DIR`,
saves IndexedDB to a partial file,
validates exactly one storage-state origin equal to `VR_BASE_URL`, requires
nonempty IndexedDB evidence, validates the exact post-login `/profile` route and
company markers (`YOUR PROFILE` and `Basic Group Info`), installs the mutation
guard before login, atomically promotes the file, removes partials on failure,
and unconditionally rejects admin and individual state in this phase.
Auth-state loading must reject malformed JSON, extra/wrong origins, missing or
non-Firebase IndexedDB, admin/individual state, a non-reference-only company
case, and origin drift before navigation.

Make capture, diff, and report entrypoints import-safe and export command
runners returning exit codes rather than calling `process.exit`. Assert a pure,
injected verifier runs capture, then diff even after capture failure or throw,
then always attempts report; returns the earliest upstream nonzero code; and
partitions verified flags so capture receives selection only, diff receives
threshold only, and report receives none. Unknown, duplicate, or ignored flags
must fail before any stage.

- [ ] **Step 2: Run and verify RED**

Run visual unit tests; expect missing verifier and IndexedDB option failures.

- [ ] **Step 3: Implement auth and verifier contracts**

Use `context.storageState({ indexedDB: true, path: partial })`, validate the
serialized partial, and rename atomically. Never log secrets, serialize page
text, or overwrite a prior valid state after a failed login. The setup utility
may create a manually approved company reference state, but tests and this task
must not perform a live login. Existing company state remains read-only
reference input, not CI proof, and capture never submits forms. Export an
injected `runAuthSetupCommand(argv, env, cwd, deps): Promise<0 | 1>` behind a
thin `import.meta.url` main guard; unit tests use fake browser/page/context
dependencies and never perform a live login.

The application has no Auth/Firestore emulator wiring or trustworthy emulator
provenance format yet, so this task must not claim individual, company, or admin
blocking gates. `loadAuthState` accepts only company reference input and
unconditionally rejects admin and individual. A nonanonymous visual case whose
policy is not `reference-only` fails before browser creation, so a future
manifest edit cannot silently promote live auth evidence. Live admin state is
forbidden because authenticated admin mounts can write `admin_users`;
emulator-backed admin/individual/company promotion is deferred until the app
has explicit emulator wiring and provenance. The
logged-out admin `Access Restricted` behavior remains semantic-gate coverage,
not a new authenticated visual case.

Validate the Playwright JSON schema rather than merely checking for any
IndexedDB array. Require exactly top-level `{ cookies, origins }`, empty cookies
for this client-auth application, exactly one canonical origin equal to
`VR_BASE_URL`, a well-formed localStorage array, and IndexedDB containing
database `firebaseLocalStorageDb`, store `firebaseLocalStorage`, and at least
one record. Do not log record keys or values. Return the validated in-memory
storage state and pass that object to `browser.newContext`; validating a path
and then letting Playwright reread it creates a TOCTOU gap. Playwright runtime
supports the IndexedDB field; use one narrow boundary cast if its generated
public object type omits it, without reconstructing away the field.

Before `browser.newContext`, every nonanonymous capture loads and validates its
storage-state JSON against the exact configured origin. Anonymous cases require
no state. A stale file manually placed in `VR_AUTH_DIR` must fail before any page
navigation; validating only during auth setup is insufficient.

During auth setup, call `prepareCaptureContext` before navigating to login,
assert no mutations after the exact same-origin `/profile` route and company
markers settle, and assert again immediately before promoting state. This fails
closed if an unexpectedly admin-capable account triggers the mount-time
`admin_users` write. Require no search/hash on the final profile URL. Always
close page/context/browser in `finally`; use a unique same-directory partial,
restrict auth directory/state permissions, remove the partial on every failure,
preserve any prior final, and rename only after state and mutation validation.

Refactor CLI modules to expose import-safe runners
`(argv, env, cwd, deps?) => Promise<0 | 1>` such as `runCaptureCommand`,
`runDiffCommand`, and `runReportCommand`, guarded with an `import.meta.url` main
check. Runners never mutate `process.exitCode`; only the thin main guards for
auth setup, capture, diff, report, and verify set it. The verifier uses injected
runners in tests and the real runners in production; it does not shell out or
infer success from stale files.

The verifier owns selection and passes it to `capture.ts capture`. Diff consumes
and validates that exact capture matrix; report consumes only the new diff
summary. Neither independently reselects or silently subsets routes.

Canonicalize validated verifier arguments before dispatch:

- capture: leading `capture` command plus `--cluster`, `--only`, `--target`, and
  `--viewport` when present;
- diff: only `--threshold`;
- report: no flags.

Capture/diff/report thrown errors become stage exit code 1 without preventing
later required stages. Return `captureCode || diffCode || reportCode`. The
"always report" guarantee applies when the artifact root is writable; if no
current failure summary can be written, remove/invalidate stale report evidence
best-effort and fail explicitly.

Freshness is an orchestration precondition. First parse verifier arguments,
resolve safe visual paths, and call `resolveVisualSelection(..., MANIFEST,
cwd)`; invalid CLI/selection fails without mutating evidence or calling a stage.
Only then invalidate the generated capture summary, diff generation, and report
using symlink-safe fixed targets under the validated artifact root. Seeded stale
green capture/diff/report evidence plus a throwing capture and throwing diff
must end with a current failure report or no report, never a stale green page.
The sequential verifier is the only writer for its run.

Add scripts:

```json
{
  "vr:unit": "vitest run scripts/visual-regression/*.test.ts",
  "vr:lint": "eslint scripts/visual-regression --max-warnings=0",
  "vr:typecheck": "tsc -p scripts/visual-regression/tsconfig.json --noEmit",
  "vr:auth": "tsx scripts/visual-regression/auth-setup.ts",
  "vr:baseline": "tsx scripts/visual-regression/capture.ts baseline",
  "vr:capture": "tsx scripts/visual-regression/capture.ts capture",
  "vr:diff": "tsx scripts/visual-regression/diff.ts",
  "vr:report": "tsx scripts/visual-regression/report.ts",
  "vr:verify": "tsx scripts/visual-regression/verify.ts"
}
```

Remove the temporary `vr:current` alias. It can hide which safe capture
entrypoint owns current output and is no longer needed.

Do not rely on an implicit worktree-local `.env.local`; ignored environment
files are not copied into git worktrees. Callers supply public build values and
visual credentials explicitly. Never add a permanent `VITE_APP_*` fallback to
the Next application; that bridge belongs only to deliberate local migration
setup while Next freezes `NEXT_PUBLIC_*` values at build time.

- [ ] **Step 4: Run unit suite GREEN**

Run `npm run vr:unit`, `npm run vr:lint`, and `npm run vr:typecheck` under Node
22.22.0, then the full browser-enabled suite and the production build. The
visual TypeScript config must include every nested visual script/test because
the root `tsconfig.json` currently covers only `app` and `src`.

Expected: all manifest/config/stability/diff/report/verifier contracts pass and
every nested visual-regression TypeScript file is linted independently of the
repository's inherited warning ceiling.

- [ ] **Step 5: Commit**

```bash
git add package.json scripts/visual-regression/tsconfig.json scripts/visual-regression/auth-state.ts scripts/visual-regression/auth-state.test.ts scripts/visual-regression/auth-setup.ts scripts/visual-regression/auth-setup.test.ts scripts/visual-regression/capture.ts scripts/visual-regression/diff.ts scripts/visual-regression/report.ts scripts/visual-regression/verify.ts scripts/visual-regression/verify.test.ts
git commit -m '[DEV-511] Add the visual migration verifier'
```

### Task 6: Calibrate and complete the trustworthy legacy corpus

**Files:**
- Create: `app/fonts/*` (pinned WOFF2 assets, license, provenance, hashes)
- Create: `app/fonts.ts`
- Create: `app/fonts.test.ts`
- Modify: `app/layout.tsx`
- Modify: `package.json`
- Modify: `playwright.config.ts`
- Create: `playwright.config.test.ts`
- Modify: every `src/**/*.{ts,tsx,scss,css}` direct legacy font-family consumer
- Modify: `src/styles/custom.scss`
- Modify: `src/theme/styleVars.ts`
- Modify: `tailwind.config.js`
- Modify: `scripts/visual-regression/manifest.ts`
- Modify: `scripts/visual-regression/manifest.test.ts`
- Modify: `scripts/visual-regression/stability.ts`
- Modify: `scripts/visual-regression/stability.test.ts`
- Modify: `docs/superpowers/plans/2026-07-16-characterization-harness.md`
- Modify: `docs/superpowers/specs/2026-07-16-nextjs-wholesale-migration-design.md`

- [x] **Step 1: Own and test the legacy brand fonts**

Use pinned, licensed local WOFF2 assets with `next/font/local`; do not use the
legacy runtime Google stylesheet or a build-time network fetch. Preserve the
five faces requested by the legacy page: Montserrat normal 400/700, Open Sans
normal 300/600, and Lora italic 400. Adding variable or extra weights can change
legacy weight synthesis and therefore pixels. Expose the three families through
stable CSS variables from the root layout and migrate shared SCSS,
styled-component, Tailwind, and direct-literal font declarations to them. The
browser must make no request to `fonts.googleapis.com` or `fonts.gstatic.com`.

Write the contract tests first. They must prove the exact local font options,
asset inventory and SHA-256 values, WOFF2 metadata, root-layout variables,
shared font tokens, license, and provenance. Record the immutable authoritative
Google Fonts repository URL and commit, original asset path/filename, retrieval
date, subset/glyph coverage, and mapping to every declared
family/style/weight. Include the exact redistribution license text and hash; a
live Google stylesheet alone is not authoritative provenance.

Mechanically convert every direct legacy font-family consumer, including admin
and production forms, to a CSS variable. Add a source-wide contract test that
rejects raw Montserrat, Open Sans, or Lora `font-family` declarations outside
the local-font definition/provenance fixtures. Tailwind, SCSS,
styled-components, and direct declarations must all resolve through
`--font-montserrat`, `--font-open-sans`, or `--font-lora`.

- [x] **Step 2: Make font readiness fail closed**

Add required font tuples to the visual manifest. Every blocking candidate must
declare all five family/style/weight tuples. During stabilization, resolve each
CSS variable, force-load its tuple with the CSS Font Loading API, and fail when
the variable is absent, the face is absent, loading rejects, or the final status
is not `loaded`. Record the logical family, resolved generated family, style,
weight, status, and same-origin font resource evidence in the capture summary.
Reject Google Fonts traffic and require the tested font resources to come from
the tested origin under `/_next/static/media/`.

Add negative coverage for the current `fonts: []` case and each missing/error
path. Reference-only and missing cases may omit required fonts until promoted,
but a blocking candidate may not. A fallback family cannot satisfy a required
tuple.

- [x] **Step 3: Prepare an immutable calibration generation**

Use a unique directory under `/private/tmp/cag-vr/`. Produce and retain a
sorted per-file SHA-256 inventory of the approved source corpus. Copy only the
six selected desktop baselines into a disjoint `baseline/` directory, verify
the copy against the source inventory, and make the copied tree read-only.
Artifacts belong in a sibling `artifacts/` directory. Record provenance per
selected file. A root without `calibration-provenance.json` is the legacy
May-only corpus; a versioned successor must carry the same strict provenance
file in both independent roots. Validate its paths, sizes, SHA-256 values,
capture dates, approval, and optional source revision against the evidence
before the record may say `status: verified`.

Build exactly once with one explicit public environment. Before starting the
server, fail if `127.0.0.1:3100` is occupied. Start that one `.next` production
build explicitly on that address and port with a bounded readiness wait and
guaranteed cleanup. Probe `/api/health/ready` and a known CAG route marker;
never attach to an existing process. Supply public build values explicitly and
never read visual credentials from `.env.local` implicitly.

Add an explicit Playwright external-server mode that neither rebuilds nor
starts a server and points at `http://127.0.0.1:3100`. Keep the ordinary
self-hosting Playwright mode for standalone developer and CI runs. Unit-test
the configuration split so calibration cannot accidentally own a second build
or process.

- [x] **Step 4: Run semantic and visual gates against the same build**

```bash
VR_BASE_URL=http://127.0.0.1:3100 \
VR_BASELINE_DIR=/private/tmp/cag-vr/<generation>/baseline \
VR_ARTIFACT_DIR=/private/tmp/cag-vr/<generation>/artifacts \
PATH=/Users/chrisknuteson/.nvm/versions/node/v22.22.0/bin:$PATH \
npm run vr:verify -- \
  --only=faq,donate,about-us,login,signup,forgot-password \
  --viewport=desktop
```

Run all 34 semantic browser cases through the external-server mode, then the
visual verifier, while the single production process remains active. Both use
the exact same `.next` output and environment and run sequentially against port
3100. Both gates must pass before a route cluster can migrate.
Redirects, logout, HTTP 404 behavior, exact settled URLs, page errors,
navigation, and form semantics remain semantic-only assertions.
Abort live Firestore traffic during characterization so provider reachability
cannot change expected page errors or touch live project data.

After the run, verify both the source and copied SHA-256 inventories again.
Fail for any added, removed, renamed, or changed baseline. Preserve the portable
report and calibration record even on failure.

- [x] **Step 5: Keep re-baselining review-only**

Never overwrite or replace an approved baseline in place. A changed candidate
remains failing until its cause is classified. A new versioned compatibility
baseline requires semantic E2E success, two byte-identical compatibility-host
captures, old/current/new visual review, documented reason and provenance, and
explicit review approval. The threshold remains `0.001`; threshold or mask
changes cannot manufacture a pass.

Calibration outcome on 2026-07-17:

- The May Donate image remained valid historical evidence but became stale
  after `dd0cf898` intentionally added Young Leaders Fund. It was not masked,
  downgraded, or overwritten.
- Three post-change captures were byte-identical at
  `4f268a4206ab44894e812bded5e901d5aaa201c4edb6eb20c5983b7896a33216`.
- The approved and independent read-only composite roots are under
  `/private/tmp/cag-vr/baselines/compatibility-v2-2026-07-17/` and retain five
  May files plus the reviewed July Donate successor.
- `/private/tmp/cag-vr/calibration-LLz9JR/calibration-record.json` records
  verified file-scoped provenance, one passing build, 34 passing semantic
  cases, and a passing visual gate. All six blocking screenshots compared
  identically at ratio `0`.

- [ ] **Step 6: Normalize frame-bearing routes before promoting them**

`home` and `theatre-resources` contain live cross-origin iframes. Keep both
reference-only until the compatibility capture and migrated capture apply the
same explicit frame blocking or deterministic replacement policy. Record a new
hardened compatibility baseline externally, prove a repeated capture is stable,
then promote them to `blocking-candidate`; do not mask the whole iframe region.

- [ ] **Step 7: Add missing static-route inventory before cutover**

Add `terms-of-service` and `privacy-policy` manifest entries with desktop
readiness contracts and `baselinePolicy: { kind: 'missing', reason: ... }`.
Capture their compatibility-host baselines into the external public-static
baseline directory, verify repeated captures, then promote them to
`blocking-candidate`. Their absence from the old React/Tailwind corpus must
block removal of their compatibility routes.

- [ ] **Step 8: Enforce policy transitions before later clusters**

Treat get-involved/events/shows/roles and every authenticated page as
reference-only until emulator fixtures exist. Capture missing/masked/mobile
legacy baselines before removing that cluster's compatibility implementation.
Redirects, logout, and HTTP 404 are semantic-only tests.

Keep the six approved desktop routes as blocking candidates. Keep Home and
theatre resources reference-only until their frame policy and two-capture
repeatability gate passes. Keep live-data and authenticated routes
reference-only until emulator fixtures and identity readiness exist. Keep
mobile nonblocking until an approved compatibility baseline exists. Reports
must distinguish blocking, reference-only/non-enforced, and missing evidence,
including reasons. Reference-only pixel deltas are informational, but capture
or evidence-integrity failures still fail the verifier.

- [ ] **Step 9: Establish the per-cluster command**

```bash
VR_BASE_URL=http://127.0.0.1:3100 \
VR_BASELINE_DIR=/private/tmp/cag-vr/baselines/public-static \
VR_ARTIFACT_DIR=/private/tmp/cag-vr/runs/public-static \
PATH=/Users/chrisknuteson/.nvm/versions/node/v22.22.0/bin:$PATH \
npm run vr:verify -- --cluster=public-static --threshold=0.001
```

Capture failure, missing baseline, or more than 0.1% pixel delta blocks the
public-static cluster commit. Use the same command with the matching named
baseline/artifact directories for each subsequent cluster only after its
legacy baseline inventory is complete. Review the portable HTML report even
when the command passes.

- [ ] **Step 10: Recalibrate on the target builder**

The compatibility host currently invokes `next build --webpack`. This initial
run may characterize the existing host, but it cannot certify the migration
target. After the planned Turbopack cutover, build once and repeat the complete
external-server semantic and immutable visual calibration against that exact
output. The final cluster gate must use the same builder, font ownership, and
asset pipeline as the App Router target.

- [ ] **Step 11: Run full non-container verification**

Run `npm test`, `npm run test:e2e`, `npm run lint:check`, `npm run build`,
`npm run vr:unit`, `npm run vr:lint`, and `npm run vr:typecheck` under Node
22.22.0. Expected: all pass; current Sass warnings remain inherited noise and
are not expanded into this migration.

- [ ] **Step 12: Commit the corrected spec and plans**

```bash
git add app/fonts app/fonts.ts app/fonts.test.ts app/layout.tsx package.json playwright.config.ts playwright.config.test.ts src tailwind.config.js
git add scripts/visual-regression/manifest.ts scripts/visual-regression/manifest.test.ts
git add scripts/visual-regression/stability.ts scripts/visual-regression/stability.test.ts
git add -f docs/superpowers/specs/2026-07-16-nextjs-wholesale-migration-design.md docs/superpowers/plans/2026-07-16-visual-regression-migration-gate.md
git commit -m '[DEV-511] Document the visual migration gate'
```
