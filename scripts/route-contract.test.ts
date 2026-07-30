import { readFileSync } from 'node:fs';
import { applicationRoutes, redirectRoutes } from './route-contract';

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
      { path: '/events', routeClass: 'public' },
      { path: '/get-involved', routeClass: 'public' },
      { path: '/login', routeClass: 'account' },
      { path: '/logout', routeClass: 'account' },
      { path: '/forgot-password', routeClass: 'account' },
      { path: '/sign-up', routeClass: 'account' },
      { path: '/profile', routeClass: 'account' },
      { path: '/profile/messages', routeClass: 'account' },
      { path: '/profile/search/roles', routeClass: 'account' },
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
      ['/profile/messages', '/profile/messages', 'heading', 'Messages'],
      ['/profile/search/roles', '/profile/search/roles', 'heading', 'Matches'],
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
    ).toEqual([]);
  });

  it('defines the two compatibility redirects', () => {
    expect(redirectRoutes).toEqual([
      { destination: '/home', path: '/' },
      { destination: '/admin/analytics', path: '/analytics' }
    ]);
  });
});
