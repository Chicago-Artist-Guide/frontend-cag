# Next.js Wholesale Application Migration Design

## Status

Approved direction as of July 16, 2026. This design supersedes the
route-by-route React Router compatibility-host strategy and the first three
steps of the deferred data migration path in
`2026-07-16-cdk-fargate-delivery-design.md`.

The CDK, container, GitHub OIDC, Firebase-authoritative, and no-database
decisions in that document remain unchanged. This document changes the
application migration shape: the first application phase is a wholesale route
lift into the Next.js App Router, not a long-lived two-router transition.

## Goal

Move the complete Chicago Artist Guide application to a conventional Next.js
App Router structure while preserving current user behavior and keeping
Firebase authoritative. Establish a domain service boundary during that move
so components no longer depend directly on Firestore and each backend domain
can later move to a server implementation or PostgreSQL without another UI
rewrite.

The first phase must leave one routing system, one production build system,
and one explicit data-access boundary. It is an application rehost and
architectural cleanup, not an authentication or database migration.

## Decisions

- Next.js App Router owns every application URL when this phase completes.
  React Router is removed rather than retained as a compatibility shell.
- The migration covers the entire current route table, including public,
  authenticated, and administrative routes. The application is small enough
  that maintaining two routers costs more than a bounded wholesale move.
- Server Components are the default. Client Components are introduced only
  for browser-only Firebase Auth state, interactive forms, browser APIs, or
  other client state.
- Turbopack is the only supported Next.js bundler. The custom webpack image
  rule and `next build --webpack` are removed before the Next host is considered
  production-ready.
- Firebase Auth, Firestore, Storage, and email behavior remain unchanged in
  the first phase.
- Authenticated Firestore reads and writes may remain in the browser during
  this phase, but only behind domain services. UI components and route modules
  must not call Firestore directly.
- The first phase does not add Firebase Admin, service-account credentials,
  server-side Firebase sessions, RDS, PostgreSQL, dual writes, or data
  backfills.
- Server-side data access is added domain by domain later. Server Components
  import server service implementations directly; they do not call the
  application's own Route Handlers over HTTP.

## Route architecture

The existing route inventory becomes App Router pages in one coordinated
migration. Route groups organize layouts without changing public URLs:

```text
app/
  layout.tsx
  page.tsx
  analytics/page.tsx
  providers.tsx
  styled-components-registry.tsx
  (main)/
    layout.tsx
    (public)/
      home/page.tsx
      donate/page.tsx
      faq/page.tsx
      terms-of-service/page.tsx
      privacy-policy/page.tsx
      about-us/page.tsx
      theatre-resources/page.tsx
      roles/page.tsx
      shows/page.tsx
      shows/[productionId]/page.tsx
      events/page.tsx
      get-involved/page.tsx
    (account)/
      login/page.tsx
      logout/page.tsx
      forgot-password/page.tsx
      sign-up/page.tsx
      profile/page.tsx
      profile/view/[accountId]/page.tsx
      profile/messages/page.tsx
      profile/messages/[threadId]/page.tsx
      profile/search/roles/page.tsx
      profile/search/talent/[productionId]/page.tsx
      profile/search/talent/[productionId]/[roleId]/page.tsx
      production/[productionId]/manage/page.tsx
  admin/
    layout.tsx
    page.tsx
    analytics/page.tsx
    users/page.tsx
    openings/page.tsx
    events/page.tsx
    companies/page.tsx
  not-found.tsx
```

The public URL contract must not change. `/` redirects to `/home`, and
`/analytics` redirects to `/admin/analytics`. Routes with an optional current
parameter use an index page plus a single-segment dynamic child; catch-all
segments must not accept URLs that the current application rejects.

`app/layout.tsx` remains a Server Component and owns document metadata, global
styles, fonts, icons, the manifest, and third-party scripts. `app/providers.tsx`
is the narrow client boundary for the existing Firebase, user, admin,
marketing, and pagination providers. `app/(main)/layout.tsx` owns the shared
header, footer, global styled-component output, and main-page frame; the admin
layout remains separate. Passing Server Component children through the provider
boundary must not force every page module to become a Client Component.

The provider boundary performs no Firebase SDK work during server render. Its
lazy client accessor distinguishes the default Firebase app from the two
intentional named secondary app flows used for account creation. On the first
browser render, the guarded initializer supplies services synchronously; the
legacy compatibility tree remains `ssr: false`, so its existing Firebase
consumers never observe a transient null service. The new server-pre-rendered
shell tolerates nullable auth/profile/admin state before hydration and renders
Server Component children immediately rather than gating their initial HTML.

Font ownership is local and hermetic. The App Router root uses
`next/font/local` with committed, licensed, hash-pinned WOFF2 assets for the
five faces requested by the legacy document: Montserrat normal 400/700, Open
Sans normal 300/600, and Lora italic 400. Stable CSS variables feed the shared
SCSS, styled-component, and Tailwind tokens. Neither browser runtime nor the
production build depends on Google Fonts, and adding extra or variable faces is
avoided because it can change the legacy browser's weight synthesis and pixels.

The root `app/not-found.tsx` composes the same site shell used by `(main)` so an
unknown URL remains a real HTTP 404 without losing the current header, footer,
global styles, or not-found experience. It is not implemented as a `/NotFound`
page returning 200. The styled-components registry uses
`useServerInsertedHTML` so streamed App Router HTML receives the existing
styled output in a deterministic order.

Static informational pages remain Server Components. Routes whose current
behavior depends on client Firebase data render a focused client feature root
inside a Server Component page during phase one. Client authentication guards
preserve current redirect and permission behavior until server-side sessions
are separately designed.

Dynamic page wrappers await Next.js 16 `params` and `searchParams`, then pass
primitive IDs and query values into client feature roots. Nested components do
not rediscover the same route parameter. Search-param updates clone the
read-only query value before calling the Next router. A full client reload in
the legacy application remains a full reload unless a characterization test
proves `router.refresh()` is behaviorally equivalent.

## Domain service boundary

The service layer is organized by application domain, not by Firebase
collection or page. Initial domains include productions, roles, profiles,
accounts, messages, matches, events, administration, email, and storage.

```text
src/services/
  productions/
    types.ts
    client.ts
    client.test.ts
  profiles/
    types.ts
    client.ts
    client.test.ts
  messages/
    types.ts
    client.ts
    client.test.ts
  ...
src/lib/firebase/
  client.ts
```

The current feature `api.ts` functions are migration inputs. Their query
behavior can be preserved, but their public signatures must stop exposing a
`Firestore` parameter, Firebase snapshots, Firebase document references, or
Firebase-specific return types. Firebase initialization belongs inside the
client adapter boundary.

Each service exposes use-case-level operations such as
`listPublicProductions`, `getProduction`, `saveProfile`, or `sendMessage`.
Services return application DTOs declared in the domain's `types.ts`. They do
not return raw Firestore data. Mapping and validation occur as data crosses the
adapter boundary.

For the first browser-only tranche, a document DTO envelope is exactly
`{ id, data }` and never contains a snapshot or document reference. Existing
application fields may still contain provider value objects such as Firebase
timestamps until the owning domain defines a serialized representation; this
does not permit snapshots/references to leak through the envelope. Public
method parameters and unsubscribe types remain provider-neutral. Create
operations return the generated ID plus the unchanged input data without an
implicit reread. Write adapters preserve existing payloads and must not apply
the current recursive sanitizer to timestamps or server transforms, because it
would convert those non-plain objects into ordinary object literals.

Do not create empty server adapters, generic repositories, a dependency
injection framework, or an interface for every function. Introduce a formal
port only when a domain has a second implementation or a test requires a real
substitute. Until then, a small typed module is the service contract.

Client Components may obtain services through focused hooks or import a
browser-safe client service module. They must not receive a Firestore instance
from React context merely to pass it into an API function. Firebase Auth may
remain in the existing client provider because it is intentionally outside the
server migration scope. The Firebase context must stop acting as a general
Firestore and Storage service locator; those SDK instances belong inside their
adapters.

The following import boundary is enforced:

- `firebase/firestore` may be imported only by Firebase client initialization
  and client service implementations.
- `firebase/storage` may be imported only by the storage adapter and client
  services that explicitly own upload behavior.
- Every browser adapter imports `client-only`. A future Admin SDK or PostgreSQL
  adapter imports `server-only`.
- Route modules, components, hooks, and contexts do not import Firestore query
  primitives.
- No barrel file may re-export both client and future server implementations;
  this prevents the Admin SDK or server credentials from entering a browser
  bundle later.

## Rendering and data flow in phase one

Static route data flows entirely through Server Components. Existing
authenticated and dynamic Firebase behavior follows this temporary path:

```text
App Router page (Server Component)
  -> focused feature root (Client Component)
  -> domain client service
  -> Firebase browser SDK
  -> domain DTO
  -> feature UI
```

This intentionally contains, rather than disguises, the remaining client-read
debt. The debt is acceptable because the first phase removes routing and build
transitions while establishing the seam needed for later server work.

When a domain moves server-side, its path becomes:

```text
App Router page, Server Action, or Route Handler
  -> domain server service
  -> Firebase Admin or PostgreSQL adapter
  -> domain DTO
  -> Server Component or client response
```

Server Components call server services directly. Server Actions are reserved
for mutations invoked from the application UI. Route Handlers exist for
external HTTP consumers, webhooks, or browser operations that cannot use a
Server Action; they are not an internal transport layer between Server
Components and services.

## Turbopack and asset migration

The production command is `next build` with no `--webpack` flag and no
`webpack` callback in `next.config.ts`. Development and production therefore
exercise the same bundler family.

Legacy images that only need stable URLs move to `public/` and use root-relative
paths. Images that benefit from Next.js sizing and optimization use
`next/image` with supported static imports. Application code must not rely on
webpack's `asset/resource` string semantics. SCSS, Tailwind, and the existing
styled-components compiler option must build under Turbopack.

The phase-one default for the legacy image set is a behavior-preserving move
from `src/images/**` to `public/images/**`, retaining subdirectories and plain
`<img>`/styled-component string URLs. `next/image` conversion is selective,
not a prerequisite for removing webpack. A successful compile alone is not an
asset-parity test; standalone and browser checks must load representative PNG
and SVG URLs and verify rendered images are not stringified objects.

styled-components may remain for existing client UI during this phase, but new
route shells and migrated static pages use Tailwind, CSS Modules, or existing
SCSS as appropriate. The migration does not expand the styled-components
surface.

## Error handling

Services normalize missing documents, permission failures, validation errors,
and provider failures at the data boundary. Expected absence uses an explicit
nullable or discriminated application result; unexpected provider failures are
thrown with domain context and handled by route-level error boundaries or
feature-level client error states.

User-visible behavior must remain equivalent during the lift. The migration
must not convert an existing recoverable empty state into a route-level crash,
nor expose raw Firebase error messages to users.

## Verification and completion criteria

The current Vitest count is not treated as route or workflow coverage. Before
each migration slice, add the smallest characterization that proves the
behavior being moved, run it against the legacy implementation and observe it
pass, then make the migration through test-first red/green steps where behavior
changes. The overnight work remains bounded by reproducible contracts and
small commits; it does not trade an unreviewable big-bang rewrite for speed.

The initial characterization harness covers the public URL matrix, redirects,
dynamic parameters, query behavior, 404 status and shell, provider order,
logged-out guards, metadata/fonts/icons/manifest/donation script, and
representative assets. Authenticated workflows use Firebase emulators or
explicit service substitutes. The migration must not write to a real Firebase
project merely to create E2E coverage. Visual snapshots are limited to a small
set of representative layouts and states; semantic assertions remain the
primary regression contract.

The existing React/Tailwind visual-regression harness is the pixel-parity gate
for this migration, not a discarded predecessor or a second ad hoc screenshot
suite. Its route manifest, public baselines, auth-state machinery,
baseline/current buckets, pixelmatch diff, and HTML report are reused per route
cluster. Existing authenticated captures are reference-only until their
identity and ready state are independently proven; a screenshot of a login,
loading, or access-denied state is not accepted merely because it exists in an
authenticated bucket. The immutable React compatibility-host baseline may live
outside an isolated worktree; capture and diff tools therefore accept explicit
baseline, auth-state, and output directories. Migration runs write only
disposable `current`, `diff`, and report artifacts, never overwrite the
approved baseline implicitly.

Before converting a cluster, verify its existing baseline against a fresh
compatibility-host capture. After the cluster moves, capture the same routes,
viewports, auth state, readiness condition, animation policy, font state, and
volatile-element masks, then require the configured pixel threshold and review
the generated report. Public static, public-data, logged-out account, and
company-authenticated clusters are gated independently so a broad final diff
cannot hide which slice regressed. Missing baselines fail closed. Routes or
states not covered by the existing manifest must receive a baseline before
their compatibility implementation is removed.

The manifest records eight composable cluster labels: `public-static`,
`public-data`, `account-auth`, `profile-production`, `messages`, `matches`,
`admin`, and `shell`. Every screenshot state also carries an explicit baseline
policy: blocking candidate, reference-only with a reason, or missing with a
reason. A blocking candidate becomes an enforced gate only after a fresh,
repeatable compatibility-host calibration. Initially this limits strict desktop
pixel candidates to donate, FAQ, about, login, signup, and forgot-password.
Home and theatre-resources remain reference-only until their live cross-origin
iframes are normalized consistently; live-data and authenticated captures
remain reference-only until deterministic data and identity readiness exist.

Visual equality is necessary but not sufficient: browser assertions still own
redirect destinations, 404 status, focus/navigation behavior, form semantics,
and auth guards; service tests own Firebase query/write payloads. The harness
must wait on explicit route readiness plus loaded fonts and images rather than
depending only on a fixed sleep. It may mask timestamps, animated cursors, and
other proven volatile pixels, but not whole data-driven feature regions merely
to make a diff pass.

Blocking visual cases declare all five required font tuples. Capture resolves
the Next font CSS variables, force-loads each tuple, rejects empty, fallback,
or error states, and records same-origin `/_next/static/media/` evidence.
Calibration uses an immutable, hash-verified copy of the approved corpus and a
dedicated production host on `127.0.0.1:3100`; it never attaches to the
unrelated service that may occupy port 3000. The 34 semantic browser cases and
visual verifier run against the same production build. Browser characterization
aborts live Firestore traffic so provider availability cannot change the route
contract between runs. Because the compatibility host still builds with
webpack, the full calibration is repeated after Turbopack becomes the target
builder before final route-cluster approval.

The approved compatibility-v2 corpus is composite and versioned rather than an
in-place rewrite of the May evidence. About, FAQ, login, signup, and password
reset retain their byte-identical May 5/May 9 captures. Donate uses two
byte-identical July 17 captures after the intentional Young Leaders Fund change
in `dd0cf898`. Each evidence root carries the same
`calibration-provenance.json`; the runner validates every declared path, byte
count, hash, capture date, approval, and optional source revision against the
selected files before recording `status: verified`. The original May roots
remain untouched.

The wholesale phase is complete only when all of the following are true:

- Every current URL is owned by an App Router page, redirect, or
  `not-found.tsx`, with route-level smoke coverage for public, account, dynamic,
  and admin paths.
- `react-router` and `react-router-dom` are absent from application dependencies
  and source imports.
- There is no optional catch-all compatibility page and no embedded
  `BrowserRouter`, `Routes`, `Route`, or React Router navigation component.
- `next build` succeeds with Turbopack. The repository contains no custom
  webpack callback and no production command containing `--webpack`.
- Existing global styles, fonts, icons, manifest metadata, Open Graph metadata,
  and the donation widget are present in rendered Next HTML.
- Firebase-authenticated login, signup, logout, password reset, profile,
  messaging, matching, production management, and admin flows pass UAT.
- No route or UI component imports Firestore query primitives or passes a
  Firestore instance into a data function.
- Firebase context no longer exposes Firestore or Storage instances for
  arbitrary feature access.
- Domain service tests cover DTO mapping, successful reads and writes, empty
  results, and meaningful provider failures without restating private helper
  implementation.
- The production standalone server and `linux/amd64` container smoke checks
  continue to pass.
- The legacy Vite host, legacy build scripts, and migration-only configuration
  are removed once parity is proven; they are not retained as a permanent
  fallback.

## Explicitly deferred work

The next phase may add Firebase Admin, server-side Firebase session validation,
cached public Server Component queries, and server-side authenticated
mutations. That phase must design credentials, Firestore Security Rules bypass
risks, authorization, cache ownership across multiple ECS tasks, and public
field projection before implementation.

A later data phase may implement PostgreSQL adapters one domain at a time. The
domain DTOs and use-case methods created here are the migration seam, but this
phase does not add relational abstractions or distort the current Firebase
model in anticipation of an unapproved schema.

Infrastructure deployment, HTTPS, DNS cutover, Amplify retirement, and any
backend credential are separate approval gates. This application design does
not authorize those external changes.
