import type { MetadataRoute } from 'next';
import { publicConfig } from '../src/config/publicEnv';
import { getCachedActiveProductions } from '../src/services/productions/cached';

// CI builds with placeholder Firebase config (NEXT_PUBLIC_FIREBASE_PROJECT_ID
// = ci-firebase-project-id), so a build-time Firestore read here would
// either fail the build or bake in a sitemap with zero shows — the exact
// trap app/(main)/(public)/events/page.tsx hit. Rendering per request keeps
// the production list current instead.
export const dynamic = 'force-dynamic';

type ChangeFrequency = MetadataRoute.Sitemap[number]['changeFrequency'];

interface StaticRoute {
  changeFrequency: ChangeFrequency;
  path: string;
  priority: number;
}

// No `lastModified` is set anywhere below, deliberately. The static routes
// have no real content-change timestamp to report — stamping Date.now() on
// every build/request is noise to crawlers and can suppress recrawling. The
// Production document has no updated_at/created_at field either;
// audition/rehearsal/run dates are event dates, not modification dates, so
// using one of those would misrepresent what "last modified" means here.
export const STATIC_ROUTES: StaticRoute[] = [
  { changeFrequency: 'weekly', path: '/', priority: 1 },
  { changeFrequency: 'daily', path: '/roles', priority: 0.9 },
  { changeFrequency: 'daily', path: '/shows', priority: 0.9 },
  { changeFrequency: 'daily', path: '/events', priority: 0.8 },
  { changeFrequency: 'monthly', path: '/get-involved', priority: 0.6 },
  { changeFrequency: 'monthly', path: '/about-us', priority: 0.5 },
  { changeFrequency: 'monthly', path: '/theatre-resources', priority: 0.5 },
  { changeFrequency: 'monthly', path: '/faq', priority: 0.4 },
  { changeFrequency: 'monthly', path: '/donate', priority: 0.4 },
  { changeFrequency: 'yearly', path: '/privacy-policy', priority: 0.2 },
  { changeFrequency: 'yearly', path: '/terms-of-service', priority: 0.2 }
];

// Pure URL-list construction, kept separate from the Firestore call below so
// it's testable without mocking the cache layer.
export const buildSitemapEntries = (
  baseUrl: string,
  productionIds: string[]
): MetadataRoute.Sitemap => [
  ...STATIC_ROUTES.map((route) => ({
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    url: `${baseUrl}${route.path}`
  })),
  ...productionIds.map((productionId) => ({
    changeFrequency: 'weekly' as ChangeFrequency,
    priority: 0.7,
    url: `${baseUrl}/shows/${productionId}`
  }))
];

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const productions = await getCachedActiveProductions();
  const productionIds = productions
    .map((production) => production.production_id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  return buildSitemapEntries(publicConfig.siteUrl, productionIds);
};

export default sitemap;
