# Next.js Migration Characterization Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture the current route, document-head, shell, redirect, 404, and asset contracts before replacing the React Router compatibility host.

**Architecture:** A typed route manifest is the single source for HTTP smoke coverage and browser route coverage. Vitest tests exercise the smoke verifier without a server; Playwright exercises the running Next host and records current user-visible behavior. The desired App Router-only invariants live in a separate static contract test and are allowed to turn red only within the task that immediately removes the compatibility code.

**Tech Stack:** Next.js 16, React 19, Vitest 3, Playwright 1.59, TypeScript 5.5

---

### Task 1: Add the typed route contract

**Status:** Completed in `11e1725` and strengthened in `463bf3e` and
`972750f`. The live contract now also owns exact logged-out destinations,
semantic markers, and reviewed page-error allowlists. The code snippets below
record the initial RED/GREEN step; do not replace the stronger current manifest
with them.

**Files:**
- Create: `scripts/route-contract.ts`
- Create: `scripts/route-contract.test.ts`

- [ ] **Step 1: Write the failing route-contract test**

```ts
import {
  applicationRoutes,
  redirectRoutes,
  smokeHtmlRoutes
} from './route-contract';

describe('route contract', () => {
  it('contains each current public URL exactly once', () => {
    expect(applicationRoutes.map(({ path }) => path)).toEqual([
      '/home',
      '/donate',
      '/faq',
      '/terms-of-service',
      '/privacy-policy',
      '/about-us',
      '/theatre-resources',
      '/roles',
      '/shows',
      '/shows/smoke-production',
      '/events',
      '/get-involved',
      '/login',
      '/logout',
      '/forgot-password',
      '/sign-up',
      '/profile',
      '/profile/view/smoke-account',
      '/profile/messages',
      '/profile/messages/smoke-thread',
      '/profile/search/roles',
      '/profile/search/talent/smoke-production',
      '/profile/search/talent/smoke-production/smoke-role',
      '/production/smoke-production/manage',
      '/admin',
      '/admin/analytics',
      '/admin/users',
      '/admin/openings',
      '/admin/events',
      '/admin/companies'
    ]);
  });

  it('defines the two compatibility redirects', () => {
    expect(redirectRoutes).toEqual([
      { destination: '/home', path: '/' },
      { destination: '/admin/analytics', path: '/analytics' }
    ]);
  });

  it('uses representative server-smoke routes from every route class', () => {
    expect(smokeHtmlRoutes).toEqual([
      '/home',
      '/login',
      '/shows/smoke-production',
      '/profile/messages/smoke-thread',
      '/profile/search/talent/smoke-production/smoke-role',
      '/production/smoke-production/manage',
      '/admin/analytics'
    ]);
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `PATH=/Users/chrisknuteson/.nvm/versions/node/v22.22.0/bin:$PATH npx vitest run scripts/route-contract.test.ts`

Expected: FAIL because `scripts/route-contract.ts` does not exist.

- [ ] **Step 3: Implement the manifest with literal readonly data**

```ts
export type RouteClass = 'account' | 'admin' | 'public';

export interface ApplicationRoute {
  path: string;
  routeClass: RouteClass;
}

export const applicationRoutes = [
  { path: '/home', routeClass: 'public' },
  { path: '/donate', routeClass: 'public' },
  { path: '/faq', routeClass: 'public' },
  { path: '/terms-of-service', routeClass: 'public' },
  { path: '/privacy-policy', routeClass: 'public' },
  { path: '/about-us', routeClass: 'public' },
  { path: '/theatre-resources', routeClass: 'public' },
  { path: '/roles', routeClass: 'public' },
  { path: '/shows', routeClass: 'public' },
  { path: '/shows/smoke-production', routeClass: 'public' },
  { path: '/events', routeClass: 'public' },
  { path: '/get-involved', routeClass: 'public' },
  { path: '/login', routeClass: 'account' },
  { path: '/logout', routeClass: 'account' },
  { path: '/forgot-password', routeClass: 'account' },
  { path: '/sign-up', routeClass: 'account' },
  { path: '/profile', routeClass: 'account' },
  { path: '/profile/view/smoke-account', routeClass: 'account' },
  { path: '/profile/messages', routeClass: 'account' },
  { path: '/profile/messages/smoke-thread', routeClass: 'account' },
  { path: '/profile/search/roles', routeClass: 'account' },
  { path: '/profile/search/talent/smoke-production', routeClass: 'account' },
  {
    path: '/profile/search/talent/smoke-production/smoke-role',
    routeClass: 'account'
  },
  { path: '/production/smoke-production/manage', routeClass: 'account' },
  { path: '/admin', routeClass: 'admin' },
  { path: '/admin/analytics', routeClass: 'admin' },
  { path: '/admin/users', routeClass: 'admin' },
  { path: '/admin/openings', routeClass: 'admin' },
  { path: '/admin/events', routeClass: 'admin' },
  { path: '/admin/companies', routeClass: 'admin' }
] as const satisfies readonly ApplicationRoute[];

export const redirectRoutes = [
  { destination: '/home', path: '/' },
  { destination: '/admin/analytics', path: '/analytics' }
] as const;

export const smokeHtmlRoutes = [
  '/home',
  '/login',
  '/shows/smoke-production',
  '/profile/messages/smoke-thread',
  '/profile/search/talent/smoke-production/smoke-role',
  '/production/smoke-production/manage',
  '/admin/analytics'
] as const;
```

- [ ] **Step 4: Run the test and verify GREEN**

Run: `PATH=/Users/chrisknuteson/.nvm/versions/node/v22.22.0/bin:$PATH npx vitest run scripts/route-contract.test.ts`

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -f scripts/route-contract.ts scripts/route-contract.test.ts
git commit -m '[DEV-511] Add the application route contract'
```

### Task 2: Characterize browser-visible routing before cutover

**Status:** Completed in `6fc8888` and strengthened in `972750f`. The final
suite uses an isolated production host on `127.0.0.1:3100`, disables server
reuse, injects unconditional dummy Firebase/LGL values, disables Analytics,
generates redirect cases from the typed contract, and asserts HTTP status,
settled pathname, exact route semantics, and exact per-route browser errors.
It passed 33/33 and 66/66 under `--repeat-each=2`. The earlier illustrative
`next dev`/port 3000 snippet below is historical and must not be reintroduced.

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/route-characterization.e2e.ts`
- Modify: `package.json`

- [ ] **Step 1: Add a failing Playwright test for the current route matrix**

```ts
import { expect, test } from '@playwright/test';
import { applicationRoutes } from '../scripts/route-contract';

for (const route of applicationRoutes) {
  test(`${route.path} renders the application`, async ({ page }) => {
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);
    if (route.routeClass === 'admin') {
      await expect(
        page.getByRole('heading', { name: 'Access Restricted' })
      ).toBeVisible();
    } else {
      await expect(page.locator('#cag-frontend-app')).toBeVisible();
    }
  });
}

test('/ redirects to /home', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/home$/);
});

test('/analytics redirects to /admin/analytics', async ({ page }) => {
  await page.goto('/analytics');
  await expect(page).toHaveURL(/\/admin\/analytics$/);
});

test('unknown paths render the current not-found experience', async ({ page }) => {
  await page.goto('/__cag_missing_route__');
  await expect(
    page.getByRole('heading', { name: 'THIS PAGE IS NOT AVAILABLE' })
  ).toBeVisible();
});
```

- [ ] **Step 2: Run and verify RED**

Run: `PATH=/Users/chrisknuteson/.nvm/versions/node/v22.22.0/bin:$PATH npx playwright test e2e/route-characterization.e2e.ts --project=chromium`

Expected: FAIL because no Playwright configuration starts the local app.

- [ ] **Step 3: Add the Playwright configuration and script**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  expect: { timeout: 10_000 },
  fullyParallel: false,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  reporter: [['list']],
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: 'http://127.0.0.1:3000/api/health/ready'
  }
});
```

Add `"test:e2e": "playwright test"` to `package.json`. The logged-out admin
contract is the existing `Access Restricted` experience; a shell marker is
added only when the App Router admin layout replaces the legacy layout.

Install a `test.beforeEach` route for
`https://firestore.googleapis.com/**` that aborts with `blockedbyclient`.
Logged-out characterization must not depend on whether the live Firebase
project is reachable, offline, or rejects reads with a different provider
message. The existing reviewed page-error expectations then exercise one
deterministic offline boundary without writing to or reading from live
Firestore.

- [ ] **Step 4: Run and verify GREEN against the compatibility host**

Run: `PATH=/Users/chrisknuteson/.nvm/versions/node/v22.22.0/bin:$PATH npm run test:e2e -- e2e/route-characterization.e2e.ts --project=chromium`

Expected: all 34 cases pass: the route matrix, Donate's approved Young Leaders
Fund link, redirects, and visible not-found behavior. The test intentionally
does not claim an HTTP 404 yet because the catch-all cannot provide one.

- [ ] **Step 5: Commit**

```bash
git add package.json playwright.config.ts e2e/route-characterization.e2e.ts
git commit -m '[DEV-511] Characterize the legacy route behavior'
```

### Task 3: Restore the complete document-head contract

**Files:**
- Create: `app/layout.test.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write failing metadata and script assertions**

```tsx
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import RootLayout, { metadata, viewport } from './layout';

const description =
  "Diversifying Chicago Theatre by providing more equitable casting and hiring opportunities. At Chicago Artist Guide, we're reimagining how theatres find, audition, and cast artists for their productions. We envision a more equitable, accessible way for local theatres to connect directly with the diverse actors, artists, and backstage crew they represent, all in an easy-to-use online network.";

describe('RootLayout document contract', () => {
  it('exports the legacy metadata through Next', () => {
    expect(metadata).toMatchObject({
      description,
      icons: {
        apple: '/apple-touch-icon.png',
        icon: [
          { sizes: '32x32', type: 'image/png', url: '/favicon-32x32.png' },
          { sizes: '16x16', type: 'image/png', url: '/favicon-16x16.png' }
        ],
        other: [
          { color: '#00aba9', rel: 'mask-icon', url: '/safari-pinned-tab.svg' }
        ]
      },
      manifest: '/site.webmanifest',
      openGraph: {
        description,
        images: ['https://www.chicagoartistguide.org/FBCover.jpg'],
        title: 'Chicago Artist Guide: Diversifying theatre one connection at a time'
      },
      other: { 'msapplication-TileColor': '#ffc40d' },
      title: 'Chicago Artist Guide'
    });
    expect(viewport).toEqual({
      initialScale: 1,
      themeColor: '#ffffff',
      width: 'device-width'
    });
  });

  it('renders fonts, donation widget, and no-script fallback', () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <main>content</main>
      </RootLayout>
    );

    expect(markup).toContain('fonts.googleapis.com/css2');
    expect(markup).toContain('widgets.givebutter.com/latest.umd.cjs');
    expect(markup).toContain('You need to enable JavaScript to run this app.');
  });
});
```

- [ ] **Step 2: Run and verify RED**

Run: `PATH=/Users/chrisknuteson/.nvm/versions/node/v22.22.0/bin:$PATH npx vitest run app/layout.test.tsx`

Expected: FAIL because the current metadata contains only title and a shortened description.

- [ ] **Step 3: Implement the Next document contract**

```tsx
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import React, { type ReactNode } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import '../src/styles/App.scss';

const description =
  "Diversifying Chicago Theatre by providing more equitable casting and hiring opportunities. At Chicago Artist Guide, we're reimagining how theatres find, audition, and cast artists for their productions. We envision a more equitable, accessible way for local theatres to connect directly with the diverse actors, artists, and backstage crew they represent, all in an easy-to-use online network.";

export const metadata: Metadata = {
  description,
  icons: {
    apple: '/apple-touch-icon.png',
    icon: [
      { sizes: '32x32', type: 'image/png', url: '/favicon-32x32.png' },
      { sizes: '16x16', type: 'image/png', url: '/favicon-16x16.png' }
    ],
    other: [
      {
        color: '#00aba9',
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg'
      }
    ]
  },
  manifest: '/site.webmanifest',
  openGraph: {
    description,
    images: ['https://www.chicagoartistguide.org/FBCover.jpg'],
    title: 'Chicago Artist Guide: Diversifying theatre one connection at a time'
  },
  other: { 'msapplication-TileColor': '#ffc40d' },
  title: 'Chicago Artist Guide'
};

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: '#ffffff',
  width: 'device-width'
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang="en">
    <head>
      <link
        href="https://fonts.googleapis.com/css2?family=Lora:ital@1&family=Montserrat:wght@400;700&family=Open+Sans:wght@300;600&display=swap"
        rel="stylesheet"
      />
    </head>
    <body>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      {children}
      <Script
        src="https://widgets.givebutter.com/latest.umd.cjs?acct=o8yi4881nb5X1BSi"
        strategy="afterInteractive"
      />
    </body>
  </html>
);

export default RootLayout;
```

Keep `RootLayout` a Server Component and do not add Firebase providers here.

- [ ] **Step 4: Run and verify GREEN**

Run: `PATH=/Users/chrisknuteson/.nvm/versions/node/v22.22.0/bin:$PATH npx vitest run app/layout.test.tsx`

Expected: all document-contract assertions pass.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/layout.test.tsx
git commit -m '[DEV-511] Restore the Next document metadata'
```

### Task 4: Extend standalone smoke semantics without breaking the compatibility baseline

**Files:**
- Modify: `scripts/smoke-server.mjs`
- Modify: `scripts/smoke-server.test.ts`

- [ ] **Step 1: Write failing tests for manifest-driven HTML routes and public assets**

Change the healthy fetch fixture to respond for every `smokeHtmlRoutes` entry
and `/images/cagLogo1.svg`. Assert the request order is health endpoints,
every representative HTML route, the public SVG, then the `/_next/static`
asset discovered in `/home`.

- [ ] **Step 2: Run and verify RED**

Run: `PATH=/Users/chrisknuteson/.nvm/versions/node/v22.22.0/bin:$PATH npx vitest run scripts/smoke-server.test.ts`

Expected: FAIL because the verifier checks only `/home` and `/about-us` and has no public-image assertion.

- [ ] **Step 3: Implement manifest-driven smoke checks**

Import `smokeHtmlRoutes` from `./route-contract.ts`. Check each route as HTML,
retain `/home` as the source for the Next static URL, then require a successful
`/images/cagLogo1.svg` response whose content type includes `image/svg+xml`.
Do not add redirect or HTTP-404 assertions until App Router owns those URLs.

- [ ] **Step 4: Run and verify GREEN**

Run: `PATH=/Users/chrisknuteson/.nvm/versions/node/v22.22.0/bin:$PATH npx vitest run scripts/smoke-server.test.ts`

Expected: all smoke verifier tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/smoke-server.mjs scripts/smoke-server.test.ts
git commit -m '[DEV-511] Expand standalone route smoke coverage'
```

### Task 5: Add semantic shell contracts

**Files:**
- Create: `e2e/layout-characterization.e2e.ts`

- [ ] **Step 1: Write failing semantic shell assertions**

For `/home`, `/shows`, `/login`, and logged-out `/profile`, assert the primary
navigation and footer are visible. For logged-out `/admin`, assert `Access
Restricted` is visible and primary navigation/footer are absent. At a 390x844
viewport, open the navbar toggle, click `ABOUT US`, assert the URL becomes
`/about-us` and the collapse no longer has class `show`. On `/home`, assert
manifest, 16/32/Apple icons, Google Fonts, Open Graph title/description/image,
and Givebutter script URLs are present in the rendered document.

- [ ] **Step 2: Run and verify RED**

Run: `PATH=/Users/chrisknuteson/.nvm/versions/node/v22.22.0/bin:$PATH npm run test:e2e -- e2e/layout-characterization.e2e.ts --project=chromium`

Expected: metadata assertions fail before Task 3; shell and mobile-navigation
assertions characterize the compatibility host.

- [ ] **Step 3: Implement only stable semantic selectors**

Use landmark roles, accessible names, and the existing `#cag-frontend-app`
root. Do not assert generated styled-component classes. Keep screenshots out
of this file: pixel parity is implemented by
`2026-07-16-visual-regression-migration-gate.md`, which hardens and reuses the
existing React/Tailwind corpus.

- [ ] **Step 4: Run and verify GREEN after Task 3**

Run: `PATH=/Users/chrisknuteson/.nvm/versions/node/v22.22.0/bin:$PATH npm run test:e2e -- e2e/layout-characterization.e2e.ts --project=chromium`

Expected: semantic shell and document-head assertions pass.

- [ ] **Step 5: Commit**

```bash
git add e2e/layout-characterization.e2e.ts
git commit -m '[DEV-511] Add semantic layout regression contracts'
```

### Task 6: Verify the characterization tranche

**Files:**
- Modify: `docs/superpowers/specs/2026-07-16-nextjs-wholesale-migration-design.md`

- [ ] **Step 1: Run the focused unit suite**

Run: `PATH=/Users/chrisknuteson/.nvm/versions/node/v22.22.0/bin:$PATH npx vitest run scripts/route-contract.test.ts scripts/smoke-server.test.ts app/layout.test.tsx`

Expected: all focused tests pass.

- [ ] **Step 2: Run the complete existing unit suite**

Run: `PATH=/Users/chrisknuteson/.nvm/versions/node/v22.22.0/bin:$PATH npm test`

Expected: 308 inherited tests plus the new tests pass. Existing React Router and React DOM warnings are recorded as baseline noise, not hidden.

- [ ] **Step 3: Run Playwright against the compatibility host**

Run: `PATH=/Users/chrisknuteson/.nvm/versions/node/v22.22.0/bin:$PATH npm run test:e2e -- --project=chromium`

Expected: all logged-out route, redirect, shell, and metadata checks pass without writing to Firebase.

- [ ] **Step 4: Commit the corrected design and plan**

```bash
git add -f docs/superpowers/specs/2026-07-16-nextjs-wholesale-migration-design.md docs/superpowers/plans/2026-07-16-characterization-harness.md
git commit -m '[DEV-511] Plan the characterization-first migration'
```
