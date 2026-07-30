import { unstable_cache } from 'next/cache';
import { listRoleOpportunities } from './roleOpportunities';
import { listEvents } from './server';
import type { CommunityEvent, RoleOpportunity } from './types';

// Cached wrappers around the raw Firestore reads in `./server` and
// `./roleOpportunities`. See src/services/productions/cached.ts for the full
// rationale; the short version:
//
// 1. Pages that read these declare `export const dynamic = 'force-dynamic'`
//    because CI builds with placeholder Firebase config, and a build-time
//    Firestore fetch either fails the build or — worse — silently ships a
//    prerendered page containing zero rows.
// 2. Rendering per request would otherwise mean a Firestore query per
//    visitor. Caching the read bounds it to one query per window regardless
//    of traffic, while the page itself stays server-rendered.
//
// Both underlying modules stay free of Next imports so the raw reads remain
// unit-testable without a Next runtime.
//
// Events carry day-granularity dates and change rarely, so a short window is
// plenty; role opportunities change even less often. Note that the
// upcoming/past split is computed from `Date.now()` OUTSIDE these cached
// functions (see eventFilters.ts callers) — only the query result is cached,
// so the cutoff is always evaluated fresh on each request.
const EVENTS_REVALIDATE_SECONDS = 300;
const ROLE_OPPORTUNITIES_REVALIDATE_SECONDS = 600;

export const getCachedEvents = unstable_cache(
  async (): Promise<CommunityEvent[]> => listEvents(),
  ['community-events'],
  { revalidate: EVENTS_REVALIDATE_SECONDS, tags: ['events'] }
);

export const getCachedRoleOpportunities = unstable_cache(
  async (): Promise<RoleOpportunity[]> => listRoleOpportunities(),
  ['role-opportunities'],
  {
    revalidate: ROLE_OPPORTUNITIES_REVALIDATE_SECONDS,
    tags: ['role-opportunities']
  }
);
