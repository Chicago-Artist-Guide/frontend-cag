# App Router Public-Static Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development or superpowers:executing-plans and
> complete each task with RED/GREEN verification and review before continuing.

**Goal:** Move the seven deterministic public-static routes, the shared site
shell, redirects, and real 404 handling to Next.js 16 App Router while the
remaining account/data/admin routes continue temporarily through an exact,
bounded compatibility adapter.

**Architecture:** Root layout owns document metadata, scripts, global CSS, and
streamed styled-components. New pages default to Server Components and use
narrow client islands for actual interactivity. During coexistence, every URL
owns one provider tree: App Router shell routes use the extracted stack and
legacy routes keep the stack inside `LegacyApp`. A pathname-aware navigation
bridge prevents stale module-level BrowserRouter state until the fallback is
removed.

**Prerequisites:** The semantic route gate is green and the visual harness is
hardened with its external baseline policies calibrated. Use the approved
`compatibility-v2-2026-07-17` composite corpus; its retained calibration record
must show verified provenance, 34 passing semantic cases, and six identical
blocking screenshots before this slice changes route ownership. Task 1 owns the
data boundary work needed before shell extraction.

---

### Task 1: Finish the data boundaries required by the shared shell

Execute all tasks in
`2026-07-16-account-profile-service-boundary.md` before extracting providers.
Add a focused messages client operation for Header's unread count so Header no
longer obtains Firestore from context or passes it to a feature API. Preserve
the two intentional named secondary Firebase app flows behind an explicit
temporary boundary exception.

Completion evidence:

- UserContext exposes DTO IDs/data, never Firestore references or snapshots.
- Account/profile components do not import Firestore directly.
- Header unread-count tests mock a domain service, not Firebase.
- Browser Firebase initialization is lazy, default-app aware, and server safe.

### Task 2: Extract a server-pre-render-safe provider stack

**Files:**
- Create: `app/providers.tsx`
- Create: `app/providers.test.tsx`
- Modify: `src/routes/App.tsx`
- Modify: Firebase/auth/profile hooks and context types only as required for a
  nullable pre-hydration state

- [ ] Write RED tests for exact Firebase → User → Admin → Marketing →
      Pagination → ErrorBoundary nesting, one child render, one initializer per
      mounted tree, and no provider ownership in root layout.
- [ ] Perform zero SDK work during server render. On the first browser render,
      initialize the lazy Firebase client synchronously in a guarded state
      initializer. `LegacyApp` remains `ssr: false`, so fallback children never
      observe transient null services. Only auth/profile/admin hooks and the new
      server-pre-rendered shell tolerate the nullable server state. Providers
      render children immediately and never gate public initial HTML.
- [ ] Extract the final DTO-backed stack once. `LegacyApp` uses it internally;
      App Router routes use it through `SiteShell`, never both for one URL.
- [ ] Prove `App` owns exactly one stack and root layout owns none. Defer
      SiteShell and 404 ownership assertions until those files exist.
- [ ] Run focused tests, full Vitest, logged-out route E2E, lint, and build;
      commit.

### Task 3: Register styled-components and migrate the complete document head

**Files:**
- Create: `app/styled-components-registry.tsx`
- Create: `app/styled-components-registry.test.tsx`
- Modify: `app/layout.tsx`
- Create or Modify: `app/layout.test.tsx`

- [ ] RED-test one streamed style flush, request-local sheet state, and no
      duplicate CSS.
- [ ] RED-test the full legacy document contract now split between `index.html`
      and root layout: title/full description, Open Graph fields, viewport,
      manifest/icons/mask icon, theme colors, Google fonts, Givebutter script,
      global CSS, and `<noscript>`.
- [ ] Implement Next 16 metadata/viewport/script APIs and the documented
      `ServerStyleSheet` registry. Root layout must never import AppProviders.
- [ ] Run focused tests, raw-HTML assertions, lint, and build; commit.

### Task 4: Cut assets and production commands over to Turbopack

**Files:**
- Modify: `package.json`
- Modify: `next.config.ts`
- Move: behavior-preserving assets from `src/images/**` to `public/images/**`
- Modify: all affected image imports/usages and asset smoke tests

- [ ] Inventory every imported bitmap/SVG and RED-test representative public
      URLs plus critical Home/about/donate/logo assets.
- [ ] Move legacy assets to stable root-relative public URLs so string-valued
      styled/CSS/component contracts do not receive `StaticImageData`.
- [ ] Remove `--webpack` from development/production commands and remove the
      custom webpack callback. Add no Turbopack-specific escape hatch.
- [ ] Run `next build` through default Turbopack, standalone server smoke, route
      E2E, and image rendering checks; commit.

### Task 5: Separate the legacy layout and add a coexistence bridge

**Files:**
- Modify: `src/components/layout/index.tsx`
- Create: `src/routes/LegacyLayout.tsx`
- Modify: `src/routes/app-routes.tsx`
- Modify: `app/[[...path]]/page.tsx`
- Modify: `src/routes/App.tsx`
- Add focused unit and `e2e/layout-characterization.e2e.ts` tests

- [ ] Make `Layout` accept children and contain no React Router symbol; put
      `Outlet` in `LegacyLayout` only.
- [ ] RED-test transitions between two fallback-owned paths. The current
      module-level BrowserRouter must not retain the previous location after a
      Next navigation.
- [ ] Key `LegacyApp` by the awaited catch-all pathname and create a fresh
      BrowserRouter for each `App` mount from exported route objects. This is the
      single coexistence architecture; internal navigation may consistently use
      `next/link` without temporary document-anchor ownership logic.
- [ ] Next 16 catch-all params are Promise-typed and awaited.
- [ ] Prove fallback ↔ fallback navigation, one legacy layout, and one provider
      tree. Do not create or render SiteShell while its Header/Footer/ScrollToTop
      children still require React Router context; commit after semantic checks.

### Task 6: Convert shared navigation and Header's unread service

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/Footer.tsx`
- Modify: `src/components/shared/ScrollToTop.tsx`
- Create: `app/site-shell.tsx`
- Create: `app/(main)/layout.tsx`
- Create: navigation helpers and focused tests
- Modify: `e2e/layout-characterization.e2e.ts`

- [ ] Add RED tests for every internal destination, role-dependent links,
      service-backed unread refresh/clearing, mobile/outside-click close,
      path-change scroll, and same-page signup reset.
- [ ] Use `next/link` and `usePathname`; preserve external/mail/social anchors,
      visible UI, and accessibility semantics.
- [ ] Preserve same-page signup reset with a deliberate hard reload; do not use
      `router.refresh()` as a substitute for resetting Client Component state.
- [ ] After Header, Footer, and ScrollToTop are router-independent, create
      SiteShell and `(main)` layout. Prove SiteShell never wraps LegacyApp and
      owns exactly one provider/header/footer/global-style/scroll tree.
- [ ] Prove `/home` → `/login` → `/home` while both paths are still fallback
      owned; commit.

### Task 7: Add seven concrete App Router pages with narrow client islands

**Files:**
- Create: `app/(main)/(public)/{home,donate,faq,terms-of-service,privacy-policy,about-us,theatre-resources}/page.tsx`
- Create: `scripts/app-router-route-ownership.test.ts`
- Modify: corresponding route bodies/components and internal links
- Modify: route E2E tests

- [ ] Add RED raw-response assertions proving each route's unique content is in
      initial HTML and no concrete page imports LegacyApp.
- [ ] Keep static markup server-rendered. Isolate Collapsible, sliders, runtime
      styled-components, or browser APIs into the smallest practical Client
      Components; do not mark an entire page client merely for convenience.
- [ ] Convert same-origin body links to `next/link`; preserve external, hash,
      mail, form, Medium, Termly, LinkedIn, Google Forms, and Zeffy anchors.
- [ ] Add concrete ↔ fallback navigation coverage now that both ownership
      branches exist; prove the keyed LegacyApp mounts at the requested path.
- [ ] Run semantic assertions and the policy-aware visual gate: every calibrated
      blocking candidate must pass; home/resources remain report-reviewed
      reference-only until iframe normalization; terms/privacy cannot migrate
      until their compatibility baselines have been captured and promoted.
- [ ] Run full Vitest, Playwright, lint, standalone asset smoke, and Turbopack
      production build; commit.

### Task 8: Replace the optional fallback with an exact required catch-all

**Files:**
- Replace: `app/[[...path]]/page.tsx` with `app/[...path]/page.tsx`
- Create: `src/routes/remainingLegacyRoutes.ts` and tests
- Create: `app/page.tsx`, `app/analytics/page.tsx`, `app/not-found.tsx`
- Modify: `src/routes/NotFound.tsx`
- Modify: route ownership and E2E tests

- [ ] Define and RED-test the exact remaining static/dynamic segment patterns.
      Reject migrated paths, unknown paths, and excess segments.
- [ ] Add root and analytics redirects plus a site-shell 404. Unknown paths now
      return HTTP 404; remaining fallback paths stay 200.
- [ ] Prove the 404 owns exactly one SiteShell provider stack and no LegacyApp.
- [ ] Prove the concrete/redirect/legacy/404 partition exhaustively covers the
      typed route contract with no overlap or gap.
- [ ] Await Promise-typed catch-all params before matching and call `notFound()`
      outside the allowlist.
- [ ] Run the full semantic, ownership, provider, visual-policy, asset, lint,
      Vitest, and Turbopack build gates; commit.

## Slice completion evidence

- Seven concrete App Router URLs include their unique page content in initial
  HTML; every blocking visual state passes and every reference state has an
  explicitly reviewed report.
- Remaining data/account/admin paths work only through the exact required
  catch-all allowlist; unknown URLs return HTTP 404 with one SiteShell.
- Root and analytics redirects retain exact destinations.
- Header, Footer, ScrollToTop, and shared Layout contain no React Router imports
  or raw Firestore dependencies.
- Moving between new and legacy ownership branches preserves location and
  initializes one provider/Firebase tree per URL.
- Production development/build commands use Turbopack, the webpack callback is
  gone, and representative assets render from stable public URLs.
