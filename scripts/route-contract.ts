export type RouteClass = 'account' | 'admin' | 'public';

export interface BrowserMarker {
  kind: 'heading' | 'text';
  value: string;
}

export interface LoggedOutBrowserExpectation {
  destination: string;
  marker: BrowserMarker;
  pageErrors?: readonly string[];
}

export interface ApplicationRoute {
  loggedOut: LoggedOutBrowserExpectation;
  path: string;
  routeClass: RouteClass;
}

export const applicationRoutes = [
  {
    loggedOut: {
      destination: '/home',
      marker: { kind: 'heading', value: 'Discover your next dream gig' }
    },
    path: '/home',
    routeClass: 'public'
  },
  {
    loggedOut: {
      destination: '/donate',
      marker: {
        kind: 'heading',
        value: 'Donate to Support Chicago Artists'
      }
    },
    path: '/donate',
    routeClass: 'public'
  },
  {
    loggedOut: {
      destination: '/faq',
      marker: { kind: 'heading', value: 'FREQUENTLY ASKED QUESTIONS' }
    },
    path: '/faq',
    routeClass: 'public'
  },
  {
    loggedOut: {
      destination: '/terms-of-service',
      marker: { kind: 'heading', value: 'TERMS OF SERVICE' }
    },
    path: '/terms-of-service',
    routeClass: 'public'
  },
  {
    loggedOut: {
      destination: '/privacy-policy',
      marker: { kind: 'heading', value: 'PRIVACY POLICY' }
    },
    path: '/privacy-policy',
    routeClass: 'public'
  },
  {
    loggedOut: {
      destination: '/about-us',
      marker: { kind: 'heading', value: 'ABOUT US' }
    },
    path: '/about-us',
    routeClass: 'public'
  },
  {
    loggedOut: {
      destination: '/theatre-resources',
      marker: { kind: 'heading', value: 'THEATRE RESOURCES' }
    },
    path: '/theatre-resources',
    routeClass: 'public'
  },
  {
    loggedOut: {
      destination: '/roles',
      marker: { kind: 'heading', value: 'OPEN THEATRE ROLES' }
    },
    path: '/roles',
    routeClass: 'public'
  },
  {
    loggedOut: {
      destination: '/shows',
      marker: { kind: 'heading', value: 'THEATRE SHOWS' }
    },
    path: '/shows',
    routeClass: 'public'
  },
  {
    loggedOut: {
      destination: '/events',
      marker: { kind: 'heading', value: 'EVENTS' }
    },
    path: '/events',
    routeClass: 'public'
  },
  {
    loggedOut: {
      destination: '/get-involved',
      marker: { kind: 'heading', value: 'Get involved' }
    },
    path: '/get-involved',
    routeClass: 'public'
  },
  {
    loggedOut: {
      destination: '/login',
      marker: { kind: 'heading', value: 'WELCOME BACK' }
    },
    path: '/login',
    routeClass: 'account'
  },
  {
    loggedOut: {
      destination: '/login',
      marker: { kind: 'heading', value: 'WELCOME BACK' }
    },
    path: '/logout',
    routeClass: 'account'
  },
  {
    loggedOut: {
      destination: '/forgot-password',
      marker: { kind: 'heading', value: 'RESET YOUR PASSWORD' }
    },
    path: '/forgot-password',
    routeClass: 'account'
  },
  {
    loggedOut: {
      destination: '/sign-up',
      marker: { kind: 'heading', value: 'BUILD CONNECTIONS TODAY' }
    },
    path: '/sign-up',
    routeClass: 'account'
  },
  {
    loggedOut: {
      destination: '/login',
      marker: { kind: 'heading', value: 'WELCOME BACK' }
    },
    path: '/profile',
    routeClass: 'account'
  },
  {
    loggedOut: {
      destination: '/profile/messages',
      marker: { kind: 'heading', value: 'Messages' }
    },
    path: '/profile/messages',
    routeClass: 'account'
  },
  {
    loggedOut: {
      destination: '/profile/search/roles',
      marker: { kind: 'heading', value: 'Matches' }
    },
    path: '/profile/search/roles',
    routeClass: 'account'
  },
  {
    loggedOut: {
      destination: '/admin',
      marker: { kind: 'heading', value: 'Access Restricted' }
    },
    path: '/admin',
    routeClass: 'admin'
  },
  {
    loggedOut: {
      destination: '/admin/analytics',
      marker: { kind: 'heading', value: 'Access Restricted' }
    },
    path: '/admin/analytics',
    routeClass: 'admin'
  },
  {
    loggedOut: {
      destination: '/admin/users',
      marker: { kind: 'heading', value: 'Access Restricted' }
    },
    path: '/admin/users',
    routeClass: 'admin'
  },
  {
    loggedOut: {
      destination: '/admin/openings',
      marker: { kind: 'heading', value: 'Access Restricted' }
    },
    path: '/admin/openings',
    routeClass: 'admin'
  },
  {
    loggedOut: {
      destination: '/admin/events',
      marker: { kind: 'heading', value: 'Access Restricted' }
    },
    path: '/admin/events',
    routeClass: 'admin'
  },
  {
    loggedOut: {
      destination: '/admin/companies',
      marker: { kind: 'heading', value: 'Access Restricted' }
    },
    path: '/admin/companies',
    routeClass: 'admin'
  }
] as const satisfies readonly ApplicationRoute[];

export type ApplicationPath = (typeof applicationRoutes)[number]['path'];

export const redirectRoutes = [
  { destination: '/home', path: '/' },
  { destination: '/admin/analytics', path: '/analytics' }
] as const satisfies readonly {
  destination: ApplicationPath;
  path: '/' | '/analytics';
}[];
