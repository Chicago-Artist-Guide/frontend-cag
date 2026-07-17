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
