// First path segments the legacy React Router SPA can actually serve.
// page.test.ts asserts this list stays in sync with
// src/routes/app-routes.tsx; anything outside it gets a real 404 from
// the catch-all instead of a 200 with the SPA's client-side fallback.
export const LEGACY_FIRST_SEGMENTS = [
  'about-us',
  'admin',
  'analytics',
  'donate',
  'events',
  'faq',
  'forgot-password',
  'get-involved',
  'home',
  'login',
  'logout',
  'privacy-policy',
  'production',
  'profile',
  'roles',
  'shows',
  'sign-up',
  'terms-of-service',
  'theatre-resources'
] as const;
