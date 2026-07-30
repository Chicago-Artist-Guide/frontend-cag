# AGENTS.md

This file is the canonical guidance for coding agents working in this repository
(Claude Code, Codex, and any other tool that reads AGENTS.md).

Note: `CLAUDE.md` is listed in `.gitignore` and is intentionally NOT tracked, so
it cannot be the shared source of truth — it is a local pointer at this file.
Keep this document authoritative and edit it here.

## Project Overview

Chicago Artist Guide (CAG) is a platform connecting theater artists with casting opportunities in the Chicago theater community. This is the CAG frontend application using TypeScript, Firebase, and Next.js (App Router).

The app is mid-migration from a Create-React-App-style Vite SPA to Next.js. Two routers currently coexist in production — see "Routing" below before touching anything route-related.

## Commands

### Development
- `npm run dev` - Start the Next.js dev server at http://localhost:3000
- `npm run build` - Next.js production build (`next build`); this also runs the TypeScript check
- `npm run start` - Start the built Next.js app (`next start`)
- `npm test` - Run tests once (vitest)
- `npm run test:watch` - Run tests in watch mode (vitest)
- `npm run test:e2e` - Run Playwright E2E specs in `e2e/`; builds and starts the app itself on port 3100 (managed server mode). Use `npm run test:e2e:external` to run against an already-running server instead.
- `npm run test:rules` - Run Firestore security rules tests against the local emulator
- `npm run lint` - Run ESLint with auto-fix (max 250 warnings allowed)
- `npm run lint:check` - Run ESLint without auto-fix (max 406 warnings allowed); this is the CI lint gate
- `npm run verify` - Run `lint:check`, `test`, `build`, and the infra CDK verify in sequence
- `npm run audit` - Run security audit with better-npm-audit

### Legacy Vite path
The pre-migration Vite build still exists and is exercised locally, but CI no longer runs it:
- `npm run build:legacy` - `tsc && vite build`
- `npm run start:legacy` - `vite` (dev server)
- `npm run preview:legacy` - `vite preview`

### Node Version
- Use Node >=22 <23 via NVM (`nvm use`); pinned in `.nvmrc` (currently v22.22.0) and in `package.json` `engines`.

## Architecture

### Tech Stack
- **React 19** - `jsx` compiler option is `react-jsx`, so components no longer require an explicit `import React from 'react'` — the codebase still does this consistently everywhere, so keep matching that pattern rather than dropping it in new files.
- **Next.js 16 (App Router)** - primary framework; see "Routing" for how it coexists with the legacy SPA.
- **TypeScript 5.5** - Strict mode, ESNext target.
- **Firebase v10** - Modular SDK for auth, Firestore, and storage.
- **React Router v6** - Still used inside the legacy SPA (`src/routes/app-routes.tsx`) via `createBrowserRouter`.
- **Context API** - Global state management (no Redux).
- **Formik + Yup** - Form handling and validation; `react-hooks-helper` for multi-step form navigation.
- **Styling** - Tailwind CSS, SCSS, and styled-components (mixed; check existing pattern before styling a component).

### Routing — two routers coexist
This is the single most confusing thing about the current codebase; misreading it will lead to bad changes.

- `app/` is the real Next.js App Router and owns any page that has been migrated. Migrated pages currently live under `app/(main)/(public)/...` (e.g. `about-us`, `donate`, `faq`, `home`, `privacy-policy`, `terms-of-service`, `theatre-resources`, and more being migrated over time), plus `app/api/health/*` health-check routes.
- Everything **not yet migrated** is served by a catch-all route under `app/` (a `[...path]`-style dynamic segment) whose page component renders `LegacyApp` — a `next/dynamic` import of `src/routes/App` with `ssr: false`. That mounts the entire legacy React Router SPA (routes defined in `src/routes/app-routes.tsx`, `createBrowserRouter`) client-side inside the Next.js shell.
- Because the catch-all's exact path segment is being actively renamed/adjusted as more routes migrate out of the SPA and into `app/`, don't hardcode its literal folder name in other docs or code comments — find it fresh under `app/` (`find app -maxdepth 1 -type d`) if you need it. What's stable is the mechanism: unmigrated routes fall through to the legacy SPA via that catch-all.
- Before adding a new page, check whether it already exists in the legacy SPA (`src/routes/app-routes.tsx`) — decide whether you're migrating it to `app/` or editing it in place in the SPA. Don't assume one router owns "the app" — check which one currently serves the route you're changing.

### Provider Stack
The provider stack lives in `app/providers.tsx` (`AppProviders`), wrapped by `app/site-shell.tsx` (`SiteShell`, which also renders `Header`/`Footer`/`ScrollToTop`/`GlobalStyle`). Provider order:
1. `FirebaseContext` - Firebase app, auth, firestore, storage, analytics (via `useFirebase()`, backed by `getFirebaseClient()`)
2. `UserContext` - Current user, account data, profile data (via `useAuthState()` / `useProfileData()`)
3. `AdminProvider` - Admin role and permissions (UI/UX only; real authorization enforced by Firestore rules)
4. `MarketingContext` - LGL API key
5. `PaginationProvider` - Pagination state per route
6. `ErrorBoundary` - wraps children

The legacy SPA (`src/routes/App`) mounts inside this same provider tree — it does not stand up its own copy of these contexts.

Additional contexts used within specific features:
- `MatchContext` - Artist/role matching with filters
- `RoleMatchContext` - Role-specific matching
- `MessageContext` - Messaging system

### Context Access
Always use custom hooks, never `useContext` directly:
```typescript
const { firebaseAuth, firebaseFirestore } = useFirebaseContext();
const { currentUser, profile } = useUserContext();
const { hasPermission } = useAdminContext();
```

### Firebase Architecture
- **Client**: Centralized in `src/lib/firebase/client.ts` via `getFirebaseClient()`, a lazy singleton (`app`, `auth`, `firestore`, `storage`) guarded with `import 'client-only'`. `getFirebaseAnalytics()` handles the analytics singleton separately since it depends on browser support detection.
- **Authentication**: Firebase Auth manages user sessions.
- **Database**: Firestore collections: `accounts`, `profiles`, `productions`, `roles`, etc.
- **Storage**: Firebase Storage for images (user photos, posters, production images).
- **Access hooks**:
  - `useFirebaseContext()` - Access Firebase services
  - `useUserContext()` - Current user, account, profile data
  - `useAdminContext()` - Admin role/permissions (UI gating only)
  - `useAuthState()` / `useProfileData()` - Lower-level hooks used in `app/providers.tsx`

### Domain Services (new — prefer for new code)
`src/services/{accounts,profiles,messages}/` contain domain service clients that return `{ id, data }` DTOs rather than raw Firestore snapshots. Many existing components still call Firestore directly through the older feature `api.ts` pattern below — that's not wrong in already-migrated code, but new code should prefer a domain service where one exists, or follow that DTO shape when adding one.

### Feature API Pattern (legacy, still widely used)
Feature directories (e.g., `Matches/`, `Messages/`, `Profile/Company/`) contain `api.ts` files with pure async functions that take Firestore as the first parameter:
```typescript
export const getProduction = async (firebaseStore: Firestore, productionId: string) => {
  const docRef = doc(firebaseStore, 'productions', productionId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as Production : false;
};
```

### User Types
Two main account types in Firestore:
- `individual` - Artists/talent profiles
- `company` - Theater companies/producers

### Styling System
Three styling approaches coexist — match the existing pattern when modifying a component:
1. **Tailwind CSS** - Utility classes (preferred for new/simple styling)
2. **SCSS** - Component-specific styles, Bootstrap integration (`reactstrap`)
3. **styled-components** - Dynamic styling; theme variables in `src/theme/styleVars.ts` (`colors`, `fonts`, `breakpoints`)

Brand colors and the custom fonts (Open Sans, Lora, Montserrat) are defined in `tailwind.config.js` and `src/theme/styleVars.ts` — read those rather than copying values.

### Key Utilities
- `src/utils/firestore.ts` - `sanitizeDataForFirestore()` strips undefined values before Firestore writes
- `src/utils/validation.ts` - Regex patterns, error messages, validation helpers for form inputs
- `src/utils/helpers.ts` - Ethnicity/gender mapping for matching system

## Key Development Patterns

### React Components
- Functional components only (no class components)
- The codebase still explicitly imports React in every JSX/TSX file (`import React from 'react';`), even though React 19 + `react-jsx` no longer requires it — match this convention in new files
- TypeScript interfaces for props at top of file
- Shared form components (Input, Button, Card, Checkbox, etc.) in `src/components/shared/`

### Firebase Operations
- Use batched writes for related operations
- Use `sanitizeDataForFirestore()` before writing to Firestore
- Validate file uploads (type, size) before storage operations

## Pull Request Guidelines

### Branch Naming
- Create branches from `master`: `git checkout -b dev-XXX` (where XXX is the JIRA ticket number)
- Example: `dev-125` for ticket DEV-125

### PR Requirements
- Title format: `[DEV-XXX] Descriptive Title`
- Target the `staging` branch, not `master` — this is the actual working PR workflow
- Include description of changes and screenshots for UI changes
- Must pass linting; requires 1-2 tech lead approvals
- Use "Squash and Merge"; ensure commit title matches PR title

### Code Standards
- Do not add temporary dev-only routes, throwaway pages, or one-off "validation" URLs
- 2 space indentation
- Single quotes for strings (enforced by ESLint)
- No trailing commas (Prettier: `trailingComma: "none"`)
- Alphabetical ordering of attributes/properties
- No `package-lock.json` changes unless you modified `package.json`

### Important Notes
- **Production deployment**: Commits to `master` trigger automatic build and deployment to production
- Do not commit directly to `master` - always use the PR workflow, targeting `staging`
- Husky pre-commit hook runs lint-staged (prettier then eslint on staged `.ts/.tsx/.jsx` files)

## Environment Variables

The required variables are listed in `.env.example` — read that for the current set. Put real local values in `.env.local`; CI values belong in GitHub Environments. All are accessed via `process.env.NEXT_PUBLIC_*` and surfaced through `src/config/publicEnv.ts` (`publicConfig`, `createPublicConfig`) rather than read directly.

## Testing
- Framework: Vitest with jsdom environment
- Test library: `@testing-library/react`
- Unit/component test files live alongside source (`*.test.ts(x)`) as well as under `src/test/`; setup in `src/test/setupTests.ts`
- E2E: Playwright specs in `e2e/` (`*.e2e.ts`), config in `playwright.config.ts`
- Firestore rules tests: `*.rules.test.ts`, run via `npm run test:rules` against the local emulator

## Common Gotchas
- Two routers coexist (see "Routing" above) — check which one owns a page before changing it
- React 19 + `react-jsx` no longer requires explicit React imports, but the codebase still does it everywhere — keep doing it in new files
- Next.js uses `process.env.NEXT_PUBLIC_*`, not Vite's `import.meta.env` — the legacy Vite build (`build:legacy`) still relies on `import.meta.env` internally, so don't remove that support without checking both paths
- Firebase v10 uses modular imports, not v8 namespaced API
- Mix of Bootstrap 4 (`reactstrap`) and custom Tailwind components
- SCSS and styled-components coexist - check component's existing pattern before styling
- AdminContext permissions are for UI gating only; Firestore security rules enforce real authorization
- Many components still call Firestore directly instead of going through `src/services/`; that's expected in unmigrated code, but prefer the service layer for new code
