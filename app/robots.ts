import type { MetadataRoute } from 'next';
import { publicConfig } from '../src/config/publicEnv';

// Replaces the static public/robots.txt (deleted alongside this file) so the
// rules can reference the generated sitemap. Preserves every existing
// Disallow rule as-is, plus /admin, which was never blocked before.
//
// Note: /profile also matches /profile/view/{accountId}, the public artist
// profile page — blocking it may be deliberate (privacy) or an oversight
// that's suppressing indexable, SEO-relevant pages. Left unchanged; flagged
// for the user to confirm intent rather than changed here.
const robots = (): MetadataRoute.Robots => ({
  rules: {
    disallow: ['/login', '/logout', '/sign-up', '/profile', '/admin'],
    userAgent: '*'
  },
  sitemap: `${publicConfig.siteUrl}/sitemap.xml`
});

export default robots;
