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
  providers.tsx
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
marketing, and pagination providers. Passing Server Component children through
that provider boundary must not force every page module to become a Client
Component.

Static informational pages remain Server Components. Routes whose current
behavior depends on client Firebase data render a focused client feature root
inside a Server Component page during phase one. Client authentication guards
preserve current redirect and permission behavior until server-side sessions
are separately designed.

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
