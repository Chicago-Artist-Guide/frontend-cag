import {
  applicationRoutes,
  redirectRoutes,
  smokeHtmlRoutes
} from './route-contract';

describe('route contract', () => {
  it('contains each current application URL exactly once', () => {
    expect(applicationRoutes).toEqual([
      { path: '/home', routeClass: 'public' },
      { path: '/donate', routeClass: 'public' },
      { path: '/faq', routeClass: 'public' },
      { path: '/terms-of-service', routeClass: 'public' },
      { path: '/privacy-policy', routeClass: 'public' },
      { path: '/about-us', routeClass: 'public' },
      { path: '/theatre-resources', routeClass: 'public' },
      { path: '/roles', routeClass: 'public' },
      { path: '/shows', routeClass: 'public' },
      { path: '/shows/smoke-production', routeClass: 'public' },
      { path: '/events', routeClass: 'public' },
      { path: '/get-involved', routeClass: 'public' },
      { path: '/login', routeClass: 'account' },
      { path: '/logout', routeClass: 'account' },
      { path: '/forgot-password', routeClass: 'account' },
      { path: '/sign-up', routeClass: 'account' },
      { path: '/profile', routeClass: 'account' },
      { path: '/profile/view/smoke-account', routeClass: 'account' },
      { path: '/profile/messages', routeClass: 'account' },
      { path: '/profile/messages/smoke-thread', routeClass: 'account' },
      { path: '/profile/search/roles', routeClass: 'account' },
      {
        path: '/profile/search/talent/smoke-production',
        routeClass: 'account'
      },
      {
        path: '/profile/search/talent/smoke-production/smoke-role',
        routeClass: 'account'
      },
      {
        path: '/production/smoke-production/manage',
        routeClass: 'account'
      },
      { path: '/admin', routeClass: 'admin' },
      { path: '/admin/analytics', routeClass: 'admin' },
      { path: '/admin/users', routeClass: 'admin' },
      { path: '/admin/openings', routeClass: 'admin' },
      { path: '/admin/events', routeClass: 'admin' },
      { path: '/admin/companies', routeClass: 'admin' }
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

    const smokeRouteClasses = smokeHtmlRoutes.map(
      (smokePath) =>
        applicationRoutes.find(({ path }) => path === smokePath)?.routeClass
    );

    expect(new Set(smokeRouteClasses)).toEqual(
      new Set(['public', 'account', 'admin'])
    );
  });
});
