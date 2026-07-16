# Next.js Container and CI Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Vite as the production host with a Node 22, Next.js 16 standalone compatibility host that preserves the existing client application, exposes health endpoints, builds as a non-root container, and is checked by credential-free CI.

**Architecture:** Next.js App Router owns the process and HTTP boundary. A client-only catch-all route mounts the existing React Router application without attempting SSR yet; DEV-492 will migrate public routes to real server rendering incrementally. Public Firebase configuration is read through one build-system-neutral module, while Firebase remains the authoritative backend.

**Tech Stack:** Node.js 22.22, Next.js 16.2, React 19, React Router 6, Firebase 9, Vitest, Docker, GitHub Actions.

---

### Task 1: Establish a green Node 22 baseline

**Files:**
- Modify: `.nvmrc`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/components/shared/Checkbox.tsx`
- Modify: `src/hooks/useFirebase.ts`
- Test: `src/components/Profile/Individual/EditPersonalDetails.test.tsx`
- Test: `src/test/App.test.tsx`

- [ ] **Step 1: Confirm the inherited failures under Node 22**

Run:

```bash
nvm use
npm test
```

Expected: 159 tests pass; the App Firebase configuration test and two checkbox label tests fail.

- [ ] **Step 2: Associate every shared checkbox label with its input**

Use React `useId()` inside `src/components/shared/Checkbox.tsx`, preserve an explicitly supplied `id`, and pass the resulting ID to `Form.Check`. The existing failing gender-role tests are the red test for this behavior.

- [ ] **Step 3: Make Analytics optional when public configuration is absent**

Only call `getAnalytics(app)` when the browser is present and a measurement ID is configured. The context may receive `null`; no current consumer requires Analytics. The existing failing App test is the red test.

- [ ] **Step 4: Verify the inherited failures are green**

Run:

```bash
nvm use
npm test
```

Expected: 20 test files and 162 tests pass.

- [ ] **Step 5: Pin and enforce Node 22 and add a non-mutating lint command**

Set `.nvmrc` to `v22.22.0`, add `engines.node` as `>=22 <23`, preserve the auto-fixing `lint` command, and add:

```json
"lint:check": "eslint . --max-warnings=250"
```

- [ ] **Step 6: Commit the baseline**

```bash
git add .nvmrc package.json package-lock.json src/components/shared/Checkbox.tsx src/hooks/useFirebase.ts
git commit -m "[DEV-512] Establish a green Node 22 baseline"
```

### Task 2: Add a build-system-neutral public configuration boundary

**Files:**
- Create: `src/config/publicEnv.ts`
- Create: `src/config/publicEnv.test.ts`
- Modify: `src/hooks/useFirebase.ts`
- Modify: `src/routes/App.tsx`
- Modify: `src/hooks/useStaffAuth.ts`
- Modify: `src/routes/GetInvolved.tsx`
- Modify: `src/components/shared/ErrorBoundary.tsx`
- Modify: `src/components/Admin/Companies/CompanyCreateModal.tsx`
- Modify: `src/components/Admin/Companies/TheatreRequestModal.tsx`
- Modify: `vite.config.ts`

- [ ] **Step 1: Write the failing configuration tests**

Test that a supplied environment record produces the Firebase client values, derives Firebase Auth and Storage hostnames from the project ID, defaults missing public values to empty strings, and exposes a production-safe `isDevelopment` flag.

- [ ] **Step 2: Run the configuration tests and verify red**

```bash
npx vitest run src/config/publicEnv.test.ts
```

Expected: failure because `publicEnv.ts` does not exist.

- [ ] **Step 3: Implement the public configuration module**

Export `createPublicConfig(environment)` for tests plus `publicConfig`, `firebaseClientConfig`, and `isDevelopment` values for application code. Read only literal `NEXT_PUBLIC_*` keys so Next.js can inline them.

- [ ] **Step 4: Replace `import.meta.env` usage**

Use the shared configuration in Firebase initialization, the marketing provider, and the secondary Firebase app flows. Replace Vite-only development checks with `isDevelopment`.

- [ ] **Step 5: Keep the legacy Vite build available**

Use Vite's `loadEnv` to define the literal `process.env.NEXT_PUBLIC_*` values from the existing `VITE_APP_*` names. This keeps `npm run build:legacy` useful during the compatibility window.

- [ ] **Step 6: Verify tests and the legacy build**

```bash
npx vitest run src/config/publicEnv.test.ts
npm test
npm run build:legacy
```

Expected: all tests pass and Vite produces `dist/`.

- [ ] **Step 7: Commit the configuration boundary**

```bash
git add src/config vite.config.ts src/hooks src/routes src/components
git commit -m "[DEV-512] Add a public runtime configuration boundary"
```

### Task 3: Establish the Next.js compatibility host and health API

**Files:**
- Create: `app/layout.tsx`
- Create: `app/legacy-app.tsx`
- Create: `app/[[...path]]/page.tsx`
- Create: `app/api/health/live/route.ts`
- Create: `app/api/health/ready/route.ts`
- Create: `app/api/health/health.test.ts`
- Create: `next-env.d.ts`
- Create: `next.config.ts`
- Modify: `src/routes/App.tsx`
- Modify: `src/components/Profile/Form/Inputs.tsx`
- Modify: `src/components/SignUp/Individual/Credits.tsx`
- Modify: `src/routes/Home.tsx`
- Modify: `tsconfig.json`
- Modify: `tailwind.config.js`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install the pinned Next.js dependency**

```bash
npm install --save-exact next@16.2.10
```

- [ ] **Step 2: Write failing health route tests**

Import both `GET` handlers directly. Assert status 200, JSON content type, `no-store`, and bodies `{ status: 'ok' }` for liveness and `{ status: 'ready' }` for readiness.

- [ ] **Step 3: Run the health tests and verify red**

```bash
npx vitest run app/api/health/health.test.ts
```

Expected: failure because the route modules do not exist.

- [ ] **Step 4: Implement deterministic health handlers**

The handlers must not contact Firebase or any external provider. Readiness proves application initialization/configuration only, matching the ALB contract in DEV-511.

- [ ] **Step 5: Mount the legacy application client-only**

Move global stylesheet imports to `app/layout.tsx`. In `app/legacy-app.tsx`, use `next/dynamic` with `ssr: false` to load `src/routes/App.tsx`. Render it from the optional catch-all page so every existing React Router URL remains reachable.

- [ ] **Step 6: Configure standalone output and compatibility settings**

Set `output: 'standalone'`, enable styled-components support, disable Next static-image objects so existing string image imports remain compatible, and use Webpack explicitly during the migration.

- [ ] **Step 7: Switch production scripts while preserving legacy scripts**

Use:

```json
"dev": "next dev --webpack",
"start": "next start",
"build": "next build --webpack",
"build:legacy": "tsc && vite build",
"start:legacy": "vite",
"preview:legacy": "vite preview"
```

- [ ] **Step 8: Verify health tests and Next production build**

```bash
npx vitest run app/api/health/health.test.ts
npm run build
```

Expected: health tests pass and `.next/standalone/server.js` exists.

- [ ] **Step 9: Start the standalone server and smoke test it**

```bash
PORT=3100 HOSTNAME=127.0.0.1 node .next/standalone/server.js
```

Verify `/api/health/live`, `/api/health/ready`, `/home`, and one nested route return HTTP 200; `/home` may remain a client-rendered shell until DEV-492.

- [ ] **Step 10: Commit the Next host**

```bash
git add app next-env.d.ts next.config.ts package.json package-lock.json tsconfig.json tailwind.config.js src
git commit -m "[DEV-512] Host the legacy app with Next.js"
```

### Task 4: Produce and test the standalone container

**Files:**
- Create: `.dockerignore`
- Create: `Dockerfile`
- Create: `scripts/smoke-server.mjs`
- Create: `scripts/smoke-server.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing smoke-client tests**

Test the exported smoke function against a local in-memory HTTP server. It must accept 200 health responses, require JSON status values, require the app route to return HTML, retry connection failures for a bounded period, and throw a useful error for non-200 responses.

- [ ] **Step 2: Run the smoke tests and verify red**

```bash
npx vitest run scripts/smoke-server.test.ts
```

Expected: failure because `smoke-server.mjs` does not exist.

- [ ] **Step 3: Implement the smoke client**

Export the function for Vitest and execute it when invoked as a script. Accept `BASE_URL`, defaulting to `http://127.0.0.1:3000`.

- [ ] **Step 4: Add the multi-stage non-root image**

Build with `node:22.22.0-alpine`, run `npm ci` and `npm run build`, then copy `public`, `.next/standalone`, and `.next/static` into a minimal runner. Run as UID/GID 1001 and use the liveness endpoint for `HEALTHCHECK`.

- [ ] **Step 5: Verify locally**

Run the Next standalone server and `npm run smoke:server`. If Docker is available, build the image and run the same smoke command against the container.

- [ ] **Step 6: Commit the container**

```bash
git add .dockerignore Dockerfile scripts/smoke-server.mjs scripts/smoke-server.test.ts package.json
git commit -m "[DEV-512] Add the standalone production container"
```

### Task 5: Add credential-free pull-request CI

**Files:**
- Modify: `.gitignore`
- Create: `.github/workflows/pull-request.yml`

- [ ] **Step 1: Stop ignoring workflows**

Remove `.github/workflows` from `.gitignore`; keep local environment and generated output ignored.

- [ ] **Step 2: Add least-privilege CI**

Trigger pull requests targeting `master` or `staging`. Set top-level permissions to `contents: read`, use Node 22.22, run `npm ci`, `npm run lint:check`, `npm test`, `npm run build`, start the standalone server, run `npm run smoke:server`, and run `docker build` without requesting AWS or Firebase credentials.

- [ ] **Step 3: Validate workflow structure locally**

Run:

```bash
ruby -e "require 'yaml'; YAML.load_file('.github/workflows/pull-request.yml', aliases: true); puts 'workflow yaml ok'"
rg -n "write|secrets\.|configure-aws|amazon-ecr|push:" .github/workflows/pull-request.yml
```

Expected: Ruby prints `workflow yaml ok`; the search finds no write permissions, secrets, AWS login steps, ECR steps, or push trigger.

- [ ] **Step 4: Commit CI**

```bash
git add .gitignore .github/workflows/pull-request.yml
git commit -m "[DEV-512] Add credential-free pull request checks"
```

### Task 6: Final verification and handoff

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document the compatibility boundary**

Document Node 22 setup, Next development/build/start commands, legacy Vite fallback commands, public environment name mappings, health endpoints, container commands, and the fact that SSR route conversion remains in DEV-492.

- [ ] **Step 2: Run the complete verification suite**

```bash
npm run lint:check
npm test
npm run build:legacy
npm run build
npm run smoke:server
```

Expected: all commands exit zero. Record warnings separately; do not describe inherited warnings as new failures.

- [ ] **Step 3: Inspect the change set**

```bash
git status --short
git diff --check origin/master...HEAD
git log --oneline origin/master..HEAD
```

Expected: only DEV-512 files are changed, no whitespace errors, and commits are scoped to the plan.

- [ ] **Step 4: Commit documentation**

```bash
git add README.md
git commit -m "[DEV-512] Document the Next.js compatibility host"
```
