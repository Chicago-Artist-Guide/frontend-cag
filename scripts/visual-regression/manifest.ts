/**
 * Visual regression metadata layered on top of the application route contract.
 *
 * Route URLs remain owned by scripts/route-contract.ts. This manifest adds the
 * capture state, stability hints, source ownership, and baseline disposition
 * needed to use the existing screenshots during the App Router migration.
 */

import { applicationRoutes, type ApplicationPath } from '../route-contract';

export type AuthState = 'admin' | 'anonymous' | 'company' | 'individual';

export const ROUTE_CLUSTERS = [
  'account-auth',
  'admin',
  'matches',
  'messages',
  'profile-production',
  'public-data',
  'public-static',
  'shell'
] as const;

export type RouteCluster = (typeof ROUTE_CLUSTERS)[number];

export const VIEWPORT_NAMES = ['desktop', 'mobile'] as const;

export type ViewportName = (typeof VIEWPORT_NAMES)[number];

export interface Viewport {
  deviceScaleFactor: number;
  height: number;
  name: ViewportName;
  width: number;
}

export const VIEWPORTS: Record<ViewportName, Viewport> = {
  desktop: {
    deviceScaleFactor: 1,
    height: 900,
    name: 'desktop',
    width: 1440
  },
  mobile: {
    deviceScaleFactor: 1,
    height: 844,
    name: 'mobile',
    width: 390
  }
};

export type BaselinePolicy =
  | { kind: 'blocking-candidate' }
  | { kind: 'reference-only'; reason: string }
  | { kind: 'missing'; reason: string };

export interface RouteEntry {
  allowBrokenImages?: string[];
  auth: AuthState;
  baselinePolicy: BaselinePolicy;
  clusters: RouteCluster[];
  fullPage: boolean;
  id: string;
  masks?: Array<{ reason: string; selector: string }>;
  path: ApplicationPath;
  readiness: {
    hidden?: string[];
    visible: string[];
  };
  sourceGlobs: string[];
  viewports: ViewportName[];
}

export interface VisualSelection {
  clusters?: RouteCluster[];
  ids?: string[];
  target?: string;
  viewports?: ViewportName[];
}

export interface VisualCase {
  entry: RouteEntry;
  viewport: ViewportName;
}

const AUTH_STATES: readonly AuthState[] = [
  'admin',
  'anonymous',
  'company',
  'individual'
];

const applicationPaths = new Set<string>(
  applicationRoutes.map(({ path }) => path)
);

const isNonEmpty = (value: string): boolean => value.trim().length > 0;

export function validateVisualManifest(
  manifest: readonly RouteEntry[]
): readonly RouteEntry[] {
  if (manifest.length === 0) {
    throw new Error('visual manifest must contain at least one route');
  }

  const ids = new Set<string>();
  const pathAuthStates = new Set<string>();

  for (const entry of manifest) {
    if (!isNonEmpty(entry.id)) {
      throw new Error('visual route id must be non-empty');
    }
    if (ids.has(entry.id)) {
      throw new Error(`duplicate visual route id: ${entry.id}`);
    }
    ids.add(entry.id);

    const pathAuthState = `${entry.path}\0${entry.auth}`;
    if (pathAuthStates.has(pathAuthState)) {
      throw new Error(
        `duplicate path/auth state: ${entry.path} (${entry.auth})`
      );
    }
    pathAuthStates.add(pathAuthState);

    if (!applicationPaths.has(entry.path)) {
      throw new Error(`unknown application path: ${entry.path}`);
    }
    if (!AUTH_STATES.includes(entry.auth)) {
      throw new Error(`unknown auth state: ${entry.auth}`);
    }
    if (entry.clusters.length === 0) {
      throw new Error(`${entry.id} must declare at least one route cluster`);
    }
    for (const cluster of entry.clusters) {
      if (!ROUTE_CLUSTERS.includes(cluster)) {
        throw new Error(`unknown route cluster: ${cluster}`);
      }
    }
    if (entry.viewports.length === 0) {
      throw new Error(`${entry.id} must declare at least one viewport`);
    }
    for (const viewport of entry.viewports) {
      if (!VIEWPORT_NAMES.includes(viewport)) {
        throw new Error(`unknown viewport: ${viewport}`);
      }
    }
    if (
      entry.baselinePolicy.kind !== 'blocking-candidate' &&
      !isNonEmpty(entry.baselinePolicy.reason)
    ) {
      throw new Error(`${entry.id} baseline reason must be non-empty`);
    }
    if (
      entry.readiness.visible.length === 0 ||
      entry.readiness.visible.some((selector) => !isNonEmpty(selector))
    ) {
      throw new Error(
        `${entry.id} visible readiness selector must be non-empty`
      );
    }
    if (entry.readiness.hidden?.some((selector) => !isNonEmpty(selector))) {
      throw new Error(
        `${entry.id} hidden readiness selector must be non-empty`
      );
    }
    if (
      entry.sourceGlobs.length === 0 ||
      entry.sourceGlobs.some((glob) => !isNonEmpty(glob))
    ) {
      throw new Error(`${entry.id} source glob must be non-empty`);
    }
    for (const mask of entry.masks ?? []) {
      if (!isNonEmpty(mask.reason)) {
        throw new Error(`${entry.id} mask reason must be non-empty`);
      }
      if (!isNonEmpty(mask.selector)) {
        throw new Error(`${entry.id} mask selector must be non-empty`);
      }
    }
    if (entry.allowBrokenImages?.some((exemption) => !isNonEmpty(exemption))) {
      throw new Error(`${entry.id} broken-image exemption must be non-empty`);
    }
  }

  return manifest;
}

const referenceOnly = (reason: string): BaselinePolicy => ({
  kind: 'reference-only',
  reason
});

const existingManifest: RouteEntry[] = [
  {
    auth: 'anonymous',
    baselinePolicy: referenceOnly(
      'Live cross-origin iframe content is not deterministic between captures.'
    ),
    clusters: ['public-static', 'shell'],
    fullPage: true,
    id: 'home',
    path: '/home',
    readiness: { visible: ['main'] },
    sourceGlobs: [
      'src/routes/Home.tsx',
      'src/components/Home/**',
      'src/components/layout/**'
    ],
    viewports: ['desktop']
  },
  {
    auth: 'anonymous',
    baselinePolicy: { kind: 'blocking-candidate' },
    clusters: ['public-static'],
    fullPage: true,
    id: 'faq',
    path: '/faq',
    readiness: { visible: ['main'] },
    sourceGlobs: [
      'src/routes/FAQ.tsx',
      'src/components/FAQ/**',
      'src/components/layout/**'
    ],
    viewports: ['desktop']
  },
  {
    auth: 'anonymous',
    baselinePolicy: { kind: 'blocking-candidate' },
    clusters: ['public-static'],
    fullPage: true,
    id: 'donate',
    path: '/donate',
    readiness: { visible: ['main'] },
    sourceGlobs: ['src/routes/Donate.tsx', 'src/components/layout/**'],
    viewports: ['desktop']
  },
  {
    auth: 'anonymous',
    baselinePolicy: referenceOnly(
      'Live Firestore event data is not pinned to an emulator fixture.'
    ),
    clusters: ['public-data'],
    fullPage: true,
    id: 'events',
    path: '/events',
    readiness: { visible: ['main'] },
    sourceGlobs: [
      'src/routes/Events.tsx',
      'src/components/Events/**',
      'src/components/layout/**'
    ],
    viewports: ['desktop']
  },
  {
    auth: 'anonymous',
    baselinePolicy: referenceOnly(
      'Live Firestore show data is not pinned to an emulator fixture.'
    ),
    clusters: ['public-data'],
    fullPage: true,
    id: 'shows',
    path: '/shows',
    readiness: { visible: ['main'] },
    sourceGlobs: [
      'src/routes/PublicShows.tsx',
      'src/components/PublicShows/**',
      'src/components/layout/**'
    ],
    viewports: ['desktop']
  },
  {
    auth: 'anonymous',
    baselinePolicy: referenceOnly(
      'Live Get Involved data is not pinned to a deterministic fixture.'
    ),
    clusters: ['public-data'],
    fullPage: true,
    id: 'get-involved',
    path: '/get-involved',
    readiness: { visible: ['main'] },
    sourceGlobs: [
      'src/routes/GetInvolved.tsx',
      'src/components/GetInvolved/**',
      'src/components/layout/**'
    ],
    viewports: ['desktop']
  },
  {
    auth: 'anonymous',
    baselinePolicy: { kind: 'blocking-candidate' },
    clusters: ['public-static'],
    fullPage: true,
    id: 'about-us',
    path: '/about-us',
    readiness: { visible: ['main'] },
    sourceGlobs: [
      'src/routes/WhoWeAre.tsx',
      'src/components/WhoWeAre/**',
      'src/components/layout/**'
    ],
    viewports: ['desktop']
  },
  {
    auth: 'anonymous',
    baselinePolicy: referenceOnly(
      'Live cross-origin iframe content is not deterministic between captures.'
    ),
    clusters: ['public-static'],
    fullPage: true,
    id: 'theatre-resources',
    path: '/theatre-resources',
    readiness: { visible: ['main'] },
    sourceGlobs: [
      'src/routes/TheaterResources.tsx',
      'src/components/layout/**'
    ],
    viewports: ['desktop']
  },
  {
    auth: 'anonymous',
    baselinePolicy: { kind: 'blocking-candidate' },
    clusters: ['account-auth'],
    fullPage: true,
    id: 'login',
    path: '/login',
    readiness: { visible: ['form'] },
    sourceGlobs: [
      'src/routes/Login.tsx',
      'src/components/Login/**',
      'src/components/layout/**'
    ],
    viewports: ['desktop']
  },
  {
    auth: 'anonymous',
    baselinePolicy: { kind: 'blocking-candidate' },
    clusters: ['account-auth'],
    fullPage: true,
    id: 'signup',
    path: '/sign-up',
    readiness: { visible: ['main'] },
    sourceGlobs: [
      'src/routes/SignUp.tsx',
      'src/components/SignUp/**',
      'src/components/layout/**'
    ],
    viewports: ['desktop']
  },
  {
    auth: 'anonymous',
    baselinePolicy: { kind: 'blocking-candidate' },
    clusters: ['account-auth'],
    fullPage: true,
    id: 'forgot-password',
    path: '/forgot-password',
    readiness: { visible: ['form'] },
    sourceGlobs: ['src/routes/ForgotPassword.tsx', 'src/components/layout/**'],
    viewports: ['desktop']
  },
  {
    auth: 'company',
    baselinePolicy: referenceOnly(
      'Authenticated company identity is not proven; this baseline currently duplicates the login screen.'
    ),
    clusters: ['profile-production', 'shell'],
    fullPage: true,
    id: 'company-profile',
    path: '/profile',
    readiness: { visible: ['main'] },
    sourceGlobs: [
      'src/routes/Profile.tsx',
      'src/components/Profile/**',
      'src/components/layout/**'
    ],
    viewports: ['desktop']
  },
  {
    auth: 'company',
    baselinePolicy: referenceOnly(
      'Authenticated company identity and deterministic message fixtures are not yet proven.'
    ),
    clusters: ['messages'],
    fullPage: true,
    id: 'company-messages',
    path: '/profile/messages',
    readiness: { visible: ['main'] },
    sourceGlobs: [
      'src/routes/Messages.tsx',
      'src/components/Messages/**',
      'src/components/layout/**'
    ],
    viewports: ['desktop']
  },
  {
    auth: 'company',
    baselinePolicy: referenceOnly(
      'Authenticated company identity and deterministic role fixtures are not yet proven.'
    ),
    clusters: ['matches'],
    fullPage: true,
    id: 'company-roles-search',
    path: '/profile/search/roles',
    readiness: { visible: ['main'] },
    sourceGlobs: [
      'src/routes/Matches.tsx',
      'src/components/Matches/**',
      'src/components/layout/**'
    ],
    viewports: ['desktop']
  }
];

export const MANIFEST = validateVisualManifest(existingManifest);

const normalizeSourcePath = (sourcePath: string): string =>
  sourcePath.trim().replace(/^\.\//, '').replace(/\/$/, '');

const literalGlobPrefix = (glob: string): string => {
  const wildcardIndexes = ['*', '?', '[']
    .map((character) => glob.indexOf(character))
    .filter((index) => index >= 0);
  const end =
    wildcardIndexes.length === 0 ? glob.length : Math.min(...wildcardIndexes);
  return normalizeSourcePath(glob.slice(0, end));
};

const pathsOverlap = (left: string, right: string): boolean =>
  left === right ||
  left.startsWith(`${right}/`) ||
  right.startsWith(`${left}/`);

const matchesTarget = (entry: RouteEntry, target: string): boolean => {
  const normalizedTarget = normalizeSourcePath(target);
  return entry.sourceGlobs.some((glob) =>
    pathsOverlap(literalGlobPrefix(glob), normalizedTarget)
  );
};

const validateSelectionValues = <T extends string>(
  values: readonly T[] | undefined,
  allowed: readonly T[],
  label: string,
  unknownLabel: string
): void => {
  if (values === undefined) return;
  if (values.length === 0) {
    throw new Error(`${label} filter must not be empty`);
  }
  for (const value of values) {
    if (!allowed.includes(value)) {
      throw new Error(`${unknownLabel}: ${value}`);
    }
  }
};

export function selectVisualCases(
  manifest: readonly RouteEntry[],
  selection: VisualSelection
): VisualCase[] {
  const manifestIds = manifest.map(({ id }) => id);
  validateSelectionValues(
    selection.ids,
    manifestIds,
    'ids',
    'unknown visual route id'
  );
  validateSelectionValues(
    selection.clusters,
    ROUTE_CLUSTERS,
    'clusters',
    'unknown route cluster'
  );
  validateSelectionValues(
    selection.viewports,
    VIEWPORT_NAMES,
    'viewports',
    'unknown viewport'
  );
  if (selection.target !== undefined && !isNonEmpty(selection.target)) {
    throw new Error('target filter must not be empty');
  }

  const ids = selection.ids ? new Set(selection.ids) : undefined;
  const clusters = selection.clusters ? new Set(selection.clusters) : undefined;
  const viewports = selection.viewports
    ? new Set(selection.viewports)
    : undefined;

  const cases = manifest.flatMap((entry) => {
    if (ids && !ids.has(entry.id)) return [];
    if (clusters && !entry.clusters.some((cluster) => clusters.has(cluster))) {
      return [];
    }
    if (selection.target && !matchesTarget(entry, selection.target)) return [];

    return entry.viewports
      .filter((viewport) => !viewports || viewports.has(viewport))
      .map((viewport) => ({ entry, viewport }));
  });

  if (cases.length === 0) {
    throw new Error('selection selected no visual cases');
  }

  return cases;
}

/** Compatibility wrapper for scripts that still select entries by target. */
export function entriesForTarget(target: string): RouteEntry[] {
  return selectVisualCases(MANIFEST, { target }).map(({ entry }) => entry);
}
