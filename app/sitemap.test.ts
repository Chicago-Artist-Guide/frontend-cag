import { vi } from 'vitest';

// Mock at the same cache-layer seam page.tsx/roles use, so the pure
// URL-list tests don't need it and the default-export test doesn't hit
// live Firestore.
vi.mock('../src/services/productions/cached', () => ({
  getCachedActiveProductions: vi.fn()
}));

import { getCachedActiveProductions } from '../src/services/productions/cached';
import sitemap, { buildSitemapEntries, STATIC_ROUTES } from './sitemap';

const mockGetActiveProductions = vi.mocked(getCachedActiveProductions);

describe('sitemap URL-list construction', () => {
  it('builds an absolute URL for every static route with no production ids', () => {
    const entries = buildSitemapEntries('https://example.com', []);

    expect(entries).toHaveLength(STATIC_ROUTES.length);
    expect(entries.map((entry) => entry.url)).toEqual(
      STATIC_ROUTES.map((route) => `https://example.com${route.path}`)
    );
  });

  it('adds one /shows/{id} entry per production id, after the static routes', () => {
    const entries = buildSitemapEntries('https://example.com', ['p1', 'p2']);

    expect(entries).toHaveLength(STATIC_ROUTES.length + 2);
    expect(entries.slice(STATIC_ROUTES.length).map((entry) => entry.url)).toEqual([
      'https://example.com/shows/p1',
      'https://example.com/shows/p2'
    ]);
  });

  it('never fabricates a lastModified timestamp', () => {
    const entries = buildSitemapEntries('https://example.com', ['p1']);

    for (const entry of entries) {
      expect(entry.lastModified).toBeUndefined();
    }
  });

  it('sets a changeFrequency and priority on every entry', () => {
    const entries = buildSitemapEntries('https://example.com', ['p1']);

    for (const entry of entries) {
      expect(entry.changeFrequency).toBeTruthy();
      expect(typeof entry.priority).toBe('number');
    }
  });

  it('does not duplicate paths across the static route list', () => {
    const paths = STATIC_ROUTES.map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe('sitemap default export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches active productions and maps their ids onto /shows/{id}', async () => {
    mockGetActiveProductions.mockResolvedValueOnce([
      { production_id: 'p1' },
      { production_id: 'p2' }
    ] as never);

    const entries = await sitemap();

    expect(mockGetActiveProductions).toHaveBeenCalledTimes(1);
    const showUrls = entries
      .map((entry) => entry.url)
      .filter((url) => url.includes('/shows/'));
    expect(showUrls).toEqual(
      expect.arrayContaining([
        expect.stringContaining('/shows/p1'),
        expect.stringContaining('/shows/p2')
      ])
    );
  });

  it('skips productions with a missing or empty production_id', async () => {
    mockGetActiveProductions.mockResolvedValueOnce([
      { production_id: '' },
      {}
    ] as never);

    const entries = await sitemap();

    expect(entries.some((entry) => entry.url.includes('/shows/'))).toBe(false);
  });

  it('declares dynamic = force-dynamic so CI placeholder config never prerenders a Firestore read', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const source = readFileSync(
      path.resolve(process.cwd(), 'app/sitemap.ts'),
      'utf8'
    );

    expect(source).toContain("export const dynamic = 'force-dynamic'");
  });
});
