/**
 * Visual regression manifest.
 *
 * Each entry maps a route to its source dependencies. When a migration target
 * is given (e.g. src/components/Home), the runner picks only the entries whose
 * `sourceGlobs` overlap that target to keep capture time short.
 *
 * To add an auth-walled route, set `auth` to a defined state and ensure
 * auth-setup.ts produces a storageState for that state.
 */

export type AuthState = 'public' | 'company';

export type Viewport = {
  name: string;
  width: number;
  height: number;
};

export const VIEWPORTS: Record<string, Viewport> = {
  desktop: { name: 'desktop', width: 1440, height: 900 }
  // tablet/mobile can be added later
};

export type RouteEntry = {
  name: string;
  path: string;
  auth: AuthState;
  waitFor?: string;
  fullPage?: boolean;
  viewports?: Viewport[];
  sourceGlobs: string[];
};

const DEFAULT_VIEWPORTS = [VIEWPORTS.desktop];

export const MANIFEST: RouteEntry[] = [
  {
    name: 'home',
    path: '/home',
    auth: 'public',
    waitFor: 'main',
    fullPage: true,
    viewports: DEFAULT_VIEWPORTS,
    sourceGlobs: [
      'src/routes/Home.tsx',
      'src/components/Home/**',
      'src/components/layout/**'
    ]
  },
  {
    name: 'faq',
    path: '/faq',
    auth: 'public',
    waitFor: 'main',
    fullPage: true,
    viewports: DEFAULT_VIEWPORTS,
    sourceGlobs: [
      'src/routes/FAQ.tsx',
      'src/components/FAQ/**',
      'src/components/layout/**'
    ]
  },
  {
    name: 'donate',
    path: '/donate',
    auth: 'public',
    waitFor: 'main',
    fullPage: true,
    viewports: DEFAULT_VIEWPORTS,
    sourceGlobs: ['src/routes/Donate.tsx', 'src/components/layout/**']
  },
  {
    name: 'events',
    path: '/events',
    auth: 'public',
    waitFor: 'main',
    fullPage: true,
    viewports: DEFAULT_VIEWPORTS,
    sourceGlobs: [
      'src/routes/Events.tsx',
      'src/components/Events/**',
      'src/components/layout/**'
    ]
  },
  {
    name: 'shows',
    path: '/shows',
    auth: 'public',
    waitFor: 'main',
    fullPage: true,
    viewports: DEFAULT_VIEWPORTS,
    sourceGlobs: [
      'src/routes/PublicShows.tsx',
      'src/components/PublicShows/**',
      'src/components/layout/**'
    ]
  },
  {
    name: 'get-involved',
    path: '/get-involved',
    auth: 'public',
    waitFor: 'main',
    fullPage: true,
    viewports: DEFAULT_VIEWPORTS,
    sourceGlobs: [
      'src/routes/GetInvolved.tsx',
      'src/components/GetInvolved/**',
      'src/components/layout/**'
    ]
  },
  {
    name: 'about-us',
    path: '/about-us',
    auth: 'public',
    waitFor: 'main',
    fullPage: true,
    viewports: DEFAULT_VIEWPORTS,
    sourceGlobs: [
      'src/routes/WhoWeAre.tsx',
      'src/components/WhoWeAre/**',
      'src/components/layout/**'
    ]
  },
  {
    name: 'theatre-resources',
    path: '/theatre-resources',
    auth: 'public',
    waitFor: 'main',
    fullPage: true,
    viewports: DEFAULT_VIEWPORTS,
    sourceGlobs: ['src/routes/TheaterResources.tsx', 'src/components/layout/**']
  },
  {
    name: 'login',
    path: '/login',
    auth: 'public',
    waitFor: 'form',
    fullPage: true,
    viewports: DEFAULT_VIEWPORTS,
    sourceGlobs: [
      'src/routes/Login.tsx',
      'src/components/Login/**',
      'src/components/layout/**'
    ]
  },
  {
    name: 'signup',
    path: '/sign-up',
    auth: 'public',
    waitFor: 'main',
    fullPage: true,
    viewports: DEFAULT_VIEWPORTS,
    sourceGlobs: [
      'src/routes/SignUp.tsx',
      'src/components/SignUp/**',
      'src/components/layout/**'
    ]
  },
  {
    name: 'forgot-password',
    path: '/forgot-password',
    auth: 'public',
    waitFor: 'form',
    fullPage: true,
    viewports: DEFAULT_VIEWPORTS,
    sourceGlobs: ['src/routes/ForgotPassword.tsx', 'src/components/layout/**']
  },
  {
    name: 'company-profile',
    path: '/profile',
    auth: 'company',
    waitFor: 'main',
    fullPage: true,
    viewports: DEFAULT_VIEWPORTS,
    sourceGlobs: [
      'src/routes/Profile.tsx',
      'src/components/Profile/**',
      'src/components/layout/**'
    ]
  },
  {
    name: 'company-messages',
    path: '/profile/messages',
    auth: 'company',
    waitFor: 'main',
    fullPage: true,
    viewports: DEFAULT_VIEWPORTS,
    sourceGlobs: [
      'src/routes/Messages.tsx',
      'src/components/Messages/**',
      'src/components/layout/**'
    ]
  },
  {
    name: 'company-roles-search',
    path: '/profile/search/roles',
    auth: 'company',
    waitFor: 'main',
    fullPage: true,
    viewports: DEFAULT_VIEWPORTS,
    sourceGlobs: [
      'src/routes/Matches.tsx',
      'src/components/Matches/**',
      'src/components/layout/**'
    ]
  }
];

/**
 * Returns the entries whose sourceGlobs overlap the given migration target.
 * Target is a path-prefix match against any glob's literal prefix
 * (everything before the first wildcard).
 */
export function entriesForTarget(target: string): RouteEntry[] {
  const normalized = target.replace(/\/$/, '');
  return MANIFEST.filter((entry) =>
    entry.sourceGlobs.some((glob) => {
      const literalPrefix = glob.split(/[*?[]/)[0].replace(/\/$/, '');
      return (
        literalPrefix === normalized ||
        literalPrefix.startsWith(normalized + '/') ||
        normalized.startsWith(literalPrefix + '/') ||
        normalized.startsWith(literalPrefix)
      );
    })
  );
}
