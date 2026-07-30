import { unstable_cache } from 'next/cache';
import type { Production } from '../../components/Profile/Company/types';
import {
  getProductionById,
  listActiveProductions,
  listPublicOpenRoles
} from './server';
import type { PublicRoleListItem } from './types';

// Cached wrappers around the raw Firestore reads in `./server`.
//
// Two problems these solve at once:
//
// 1. Build-time prerendering. CI builds with placeholder Firebase config
//    (`ci-firebase-project-id`), so any route that fetches Firestore during
//    prerender fails the build outright. Public data pages therefore declare
//    `export const dynamic = 'force-dynamic'` and render per request instead.
//
// 2. Read cost and latency. Rendering per request would otherwise mean a fresh
//    Firestore query on every visit — the current client-side /shows already
//    reads every active production (79 at last count) on every page load, which
//    burns the 50k reads/day free allowance at roughly 630 views/day. Caching
//    the read here bounds it to one query per revalidate window no matter how
//    much traffic arrives, while the page itself stays server-rendered.
//
// Keep `./server` free of Next imports so the raw reads stay unit-testable
// without a Next runtime.
const REVALIDATE_SECONDS = 300;

export const getCachedActiveProductions = unstable_cache(
  async (): Promise<Production[]> => listActiveProductions(),
  ['active-productions'],
  { revalidate: REVALIDATE_SECONDS, tags: ['productions'] }
);

export const getCachedProductionById = unstable_cache(
  async (productionId: string): Promise<Production | null> =>
    getProductionById(productionId),
  ['production-by-id'],
  { revalidate: REVALIDATE_SECONDS, tags: ['productions'] }
);

export const getCachedPublicOpenRoles = unstable_cache(
  async (): Promise<PublicRoleListItem[]> => listPublicOpenRoles(),
  ['public-open-roles'],
  { revalidate: REVALIDATE_SECONDS, tags: ['productions'] }
);
