import { describe, expect, it } from 'vitest';
import { applicationRoutes } from '../route-contract';
import {
  MANIFEST,
  ROUTE_CLUSTERS,
  VIEWPORTS,
  VIEWPORT_NAMES,
  entriesForTarget,
  selectVisualCases,
  validateVisualManifest,
  type RouteEntry
} from './manifest';

const baselineIds = [
  'home',
  'faq',
  'donate',
  'events',
  'shows',
  'get-involved',
  'about-us',
  'theatre-resources',
  'login',
  'signup',
  'forgot-password',
  'company-profile',
  'company-messages',
  'company-roles-search'
];

const entry = (overrides: Partial<RouteEntry> = {}): RouteEntry => ({
  auth: 'anonymous',
  baselinePolicy: { kind: 'blocking-candidate' },
  clusters: ['public-static'],
  fullPage: true,
  id: 'fixture',
  path: '/home',
  readiness: { visible: ['main h1'] },
  sourceGlobs: ['src/components/Home/**'],
  viewports: ['desktop'],
  ...overrides
});

describe('visual manifest', () => {
  it('preserves the existing baseline directory IDs exactly', () => {
    expect(MANIFEST.map(({ id }) => id)).toEqual(baselineIds);
  });

  it('keeps every baseline ID assigned to its current route and auth state', () => {
    expect(MANIFEST.map(({ auth, id, path }) => [id, path, auth])).toEqual([
      ['home', '/home', 'anonymous'],
      ['faq', '/faq', 'anonymous'],
      ['donate', '/donate', 'anonymous'],
      ['events', '/events', 'anonymous'],
      ['shows', '/shows', 'anonymous'],
      ['get-involved', '/get-involved', 'anonymous'],
      ['about-us', '/about-us', 'anonymous'],
      ['theatre-resources', '/theatre-resources', 'anonymous'],
      ['login', '/login', 'anonymous'],
      ['signup', '/sign-up', 'anonymous'],
      ['forgot-password', '/forgot-password', 'anonymous'],
      ['company-profile', '/profile', 'company'],
      ['company-messages', '/profile/messages', 'company'],
      ['company-roles-search', '/profile/search/roles', 'company']
    ]);
  });

  it('is a validated view of the application route contract', () => {
    const applicationPaths = new Set(applicationRoutes.map(({ path }) => path));
    const ids = MANIFEST.map(({ id }) => id);
    const pathAuthPairs = MANIFEST.map(({ auth, path }) => `${path}\0${auth}`);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(pathAuthPairs).size).toBe(pathAuthPairs.length);
    expect(MANIFEST.every(({ path }) => applicationPaths.has(path))).toBe(true);
    expect(
      MANIFEST.every(({ clusters }) =>
        clusters.every((cluster) => ROUTE_CLUSTERS.includes(cluster))
      )
    ).toBe(true);
    expect(
      MANIFEST.every(({ viewports }) =>
        viewports.every((viewport) => VIEWPORT_NAMES.includes(viewport))
      )
    ).toBe(true);
    expect(VIEWPORTS).toEqual({
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
    });
  });

  it('records the migration clusters and blocking candidates explicitly', () => {
    expect(
      Object.fromEntries(MANIFEST.map(({ clusters, id }) => [id, clusters]))
    ).toEqual({
      'about-us': ['public-static'],
      'company-messages': ['messages'],
      'company-profile': ['profile-production', 'shell'],
      'company-roles-search': ['matches'],
      donate: ['public-static'],
      events: ['public-data'],
      faq: ['public-static'],
      'forgot-password': ['account-auth'],
      'get-involved': ['public-data'],
      home: ['public-static', 'shell'],
      login: ['account-auth'],
      shows: ['public-data'],
      signup: ['account-auth'],
      'theatre-resources': ['public-static']
    });
    expect(
      MANIFEST.filter(
        ({ baselinePolicy }) => baselinePolicy.kind === 'blocking-candidate'
      ).map(({ id }) => id)
    ).toEqual([
      'faq',
      'donate',
      'about-us',
      'login',
      'signup',
      'forgot-password'
    ]);
    expect(
      MANIFEST.filter(({ viewports }) => viewports.includes('mobile')).every(
        ({ baselinePolicy }) => baselinePolicy.kind !== 'blocking-candidate'
      )
    ).toBe(true);
  });

  it('allows one URL to have separate anonymous and authenticated states', () => {
    expect(() =>
      validateVisualManifest([
        entry({ id: 'anonymous-profile', path: '/profile' }),
        entry({ auth: 'company', id: 'company-profile', path: '/profile' })
      ])
    ).not.toThrow();
  });

  it.each([
    {
      manifest: [entry(), entry()],
      problem: 'duplicate visual route id'
    },
    {
      manifest: [entry(), entry({ id: 'other' })],
      problem: 'duplicate path/auth state'
    },
    {
      manifest: [entry({ path: '/not-a-route' as RouteEntry['path'] })],
      problem: 'unknown application path'
    },
    {
      manifest: [entry({ clusters: ['not-a-cluster' as never] })],
      problem: 'unknown route cluster'
    },
    {
      manifest: [entry({ viewports: ['not-a-viewport' as never] })],
      problem: 'unknown viewport'
    },
    {
      manifest: [entry({ clusters: ['public-static', 'public-static'] })],
      problem: 'duplicate route cluster'
    },
    {
      manifest: [entry({ viewports: ['desktop', 'desktop'] })],
      problem: 'duplicate viewport'
    },
    {
      manifest: [
        entry({
          baselinePolicy: {
            kind: 'not-a-policy'
          } as RouteEntry['baselinePolicy']
        })
      ],
      problem: 'unknown baseline policy'
    },
    {
      manifest: [
        entry({ baselinePolicy: { kind: 'reference-only', reason: ' ' } })
      ],
      problem: 'baseline reason'
    },
    {
      manifest: [entry({ baselinePolicy: { kind: 'missing', reason: '' } })],
      problem: 'baseline reason'
    },
    {
      manifest: [entry({ readiness: { visible: [] } })],
      problem: 'visible readiness selector'
    },
    {
      manifest: [entry({ readiness: { hidden: [''], visible: ['main'] } })],
      problem: 'hidden readiness selector'
    },
    {
      manifest: [entry({ sourceGlobs: [] })],
      problem: 'source glob'
    },
    {
      manifest: [entry({ sourceGlobs: [' '] })],
      problem: 'source glob'
    },
    {
      manifest: [entry({ masks: [{ reason: '', selector: '.clock' }] })],
      problem: 'mask reason'
    },
    {
      manifest: [entry({ masks: [{ reason: 'clock', selector: ' ' }] })],
      problem: 'mask selector'
    },
    {
      manifest: [
        entry({
          allowBrokenImages: [{ reason: '', selector: 'img.optional' }]
        })
      ],
      problem: 'broken-image exemption reason'
    },
    {
      manifest: [
        entry({
          allowBrokenImages: [{ reason: 'remote image', selector: ' ' }]
        })
      ],
      problem: 'broken-image exemption'
    }
  ])('rejects $problem violations', ({ manifest, problem }) => {
    expect(() => validateVisualManifest(manifest)).toThrow(problem);
  });

  it('uses route-specific semantic readiness instead of a generic main node', () => {
    expect(
      MANIFEST.every(
        ({ readiness }) =>
          !readiness.visible.includes('main') &&
          !readiness.visible.includes('body')
      )
    ).toBe(true);
  });
});

describe('selectVisualCases', () => {
  it('uses OR within a filter kind and AND across filter kinds', () => {
    expect(
      selectVisualCases(MANIFEST, {
        clusters: ['public-static', 'account-auth'],
        ids: ['home', 'faq', 'login', 'events'],
        viewports: ['desktop', 'mobile']
      }).map(({ entry: selectedEntry, viewport }) => [
        selectedEntry.id,
        viewport
      ])
    ).toEqual([
      ['home', 'desktop'],
      ['faq', 'desktop'],
      ['login', 'desktop']
    ]);
  });

  it('preserves manifest order and each entry viewport order', () => {
    const ordered = validateVisualManifest([
      entry({ id: 'first', viewports: ['mobile', 'desktop'] }),
      entry({ id: 'second', path: '/faq', viewports: ['desktop', 'mobile'] })
    ]);

    expect(
      selectVisualCases(ordered, {}).map(
        ({ entry: selectedEntry, viewport }) =>
          `${selectedEntry.id}:${viewport}`
      )
    ).toEqual([
      'first:mobile',
      'first:desktop',
      'second:desktop',
      'second:mobile'
    ]);
  });

  it('matches migration targets only across exact path boundaries', () => {
    const routes = validateVisualManifest([
      entry({ id: 'home', sourceGlobs: ['src/components/Home/**'] }),
      entry({
        id: 'home-foo',
        path: '/faq',
        sourceGlobs: ['src/components/HomeFoo/**']
      }),
      entry({
        id: 'layout',
        path: '/donate',
        sourceGlobs: ['src/components/layout/Header.tsx']
      })
    ]);

    expect(
      selectVisualCases(routes, { target: 'src/components/Home' }).map(
        ({ entry: selectedEntry }) => selectedEntry.id
      )
    ).toEqual(['home']);
    expect(
      selectVisualCases(routes, {
        target: 'src/components/layout/Header.tsx'
      }).map(({ entry: selectedEntry }) => selectedEntry.id)
    ).toEqual(['layout']);
  });

  it('returns each matching entry once when it has multiple viewports', () => {
    const routes = validateVisualManifest([
      entry({ id: 'home', viewports: ['desktop', 'mobile'] }),
      entry({ id: 'faq', path: '/faq', sourceGlobs: ['src/components/FAQ/**'] })
    ]);

    expect(entriesForTarget('src/components/Home', routes)).toEqual([
      routes[0]
    ]);
  });

  it.each([
    [{ ids: [] }, 'ids'],
    [{ clusters: [] }, 'clusters'],
    [{ viewports: [] }, 'viewports'],
    [{ target: ' ' }, 'target'],
    [{ ids: ['unknown'] }, 'unknown visual route id'],
    [{ clusters: ['unknown' as never] }, 'unknown route cluster'],
    [{ viewports: ['unknown' as never] }, 'unknown viewport']
  ] as const)('rejects invalid selection %j', (selection, problem) => {
    expect(() => selectVisualCases(MANIFEST, selection)).toThrow(problem);
  });

  it('rejects a valid filter combination that selects no cases', () => {
    expect(() =>
      selectVisualCases(MANIFEST, {
        clusters: ['messages'],
        ids: ['home']
      })
    ).toThrow('selected no visual cases');
  });
});
