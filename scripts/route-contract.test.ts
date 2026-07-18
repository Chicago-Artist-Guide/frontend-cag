import { readFileSync } from 'node:fs';
import {
  applicationRoutes,
  redirectRoutes,
  smokeHtmlRoutes
} from './route-contract';

describe('route contract', () => {
  it('blocks live Firestore reads during browser characterization', () => {
    const browserContract = readFileSync(
      'e2e/route-characterization.e2e.ts',
      'utf8'
    );

    expect(browserContract).toContain(
      "page.route('https://firestore.googleapis.com/**'"
    );
    expect(browserContract).toContain("route.abort('blockedbyclient')");
  });

  it('defines a logged-out browser expectation for every route', () => {
    expect(applicationRoutes.every((route) => 'loggedOut' in route)).toBe(true);
  });

  it('contains each current application URL exactly once', () => {
    expect(
      applicationRoutes.map(({ path, routeClass }) => ({ path, routeClass }))
    ).toEqual([
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

  it('defines each logged-out destination and semantic marker exactly', () => {
    expect(
      applicationRoutes.map(({ loggedOut, path }) => [
        path,
        loggedOut.destination,
        loggedOut.marker.kind,
        loggedOut.marker.value
      ])
    ).toEqual([
      ['/home', '/home', 'heading', 'Discover your next dream gig'],
      ['/donate', '/donate', 'heading', 'Donate to Support Chicago Artists'],
      ['/faq', '/faq', 'heading', 'FREQUENTLY ASKED QUESTIONS'],
      ['/terms-of-service', '/terms-of-service', 'heading', 'TERMS OF SERVICE'],
      ['/privacy-policy', '/privacy-policy', 'heading', 'PRIVACY POLICY'],
      ['/about-us', '/about-us', 'heading', 'ABOUT US'],
      [
        '/theatre-resources',
        '/theatre-resources',
        'heading',
        'THEATRE RESOURCES'
      ],
      ['/roles', '/roles', 'heading', 'OPEN THEATRE ROLES'],
      ['/shows', '/shows', 'heading', 'THEATRE SHOWS'],
      [
        '/shows/smoke-production',
        '/shows/smoke-production',
        'heading',
        'Show Not Found'
      ],
      ['/events', '/events', 'heading', 'EVENTS'],
      ['/get-involved', '/get-involved', 'heading', 'Get involved'],
      ['/login', '/login', 'heading', 'WELCOME BACK'],
      ['/logout', '/login', 'heading', 'WELCOME BACK'],
      [
        '/forgot-password',
        '/forgot-password',
        'heading',
        'RESET YOUR PASSWORD'
      ],
      ['/sign-up', '/sign-up', 'heading', 'BUILD CONNECTIONS TODAY'],
      ['/profile', '/login', 'heading', 'WELCOME BACK'],
      [
        '/profile/view/smoke-account',
        '/profile/view/smoke-account',
        'text',
        'Failed to load profile data. Please try again.'
      ],
      ['/profile/messages', '/profile/messages', 'heading', 'Messages'],
      [
        '/profile/messages/smoke-thread',
        '/profile/messages/smoke-thread',
        'heading',
        'Messages'
      ],
      ['/profile/search/roles', '/profile/search/roles', 'heading', 'Matches'],
      [
        '/profile/search/talent/smoke-production',
        '/profile/search/talent/smoke-production',
        'heading',
        'Matches'
      ],
      [
        '/profile/search/talent/smoke-production/smoke-role',
        '/profile/search/talent/smoke-production/smoke-role',
        'heading',
        'Matches'
      ],
      [
        '/production/smoke-production/manage',
        '/production/smoke-production/manage',
        'heading',
        'Manage Production'
      ],
      ['/admin', '/admin', 'heading', 'Access Restricted'],
      ['/admin/analytics', '/admin/analytics', 'heading', 'Access Restricted'],
      ['/admin/users', '/admin/users', 'heading', 'Access Restricted'],
      ['/admin/openings', '/admin/openings', 'heading', 'Access Restricted'],
      ['/admin/events', '/admin/events', 'heading', 'Access Restricted'],
      ['/admin/companies', '/admin/companies', 'heading', 'Access Restricted']
    ]);
  });

  it('records only the reviewed logged-out page errors', () => {
    expect(
      applicationRoutes
        .filter(({ loggedOut }) => 'pageErrors' in loggedOut)
        .map(({ loggedOut, path }) => [path, loggedOut.pageErrors])
    ).toEqual([
      [
        '/profile/messages/smoke-thread',
        ['Failed to get document because the client is offline.']
      ],
      [
        '/profile/search/talent/smoke-production',
        ['Failed to get document because the client is offline.']
      ],
      [
        '/profile/search/talent/smoke-production/smoke-role',
        ['Failed to get document because the client is offline.']
      ],
      [
        '/production/smoke-production/manage',
        ['Failed to get document because the client is offline.']
      ]
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
