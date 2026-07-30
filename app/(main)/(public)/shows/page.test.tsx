import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import type { Production } from '../../../../src/components/Profile/Company/types';

// Mock at the service boundary so the Server Component render doesn't hit
// live Firestore, mirroring app/(main)/(public)/roles/page.test.tsx.
// Mock the CACHED module — the seam `page.tsx` actually calls through.
// Mocking the raw `server.ts` underneath would still execute
// `unstable_cache`, which throws outside the Next request runtime
// ("Invariant: incrementalCache missing").
vi.mock('../../../../src/services/productions/cached', () => ({
  getCachedActiveProductions: vi.fn()
}));

import { getCachedActiveProductions } from '../../../../src/services/productions/cached';
import ShowsPage from './page';

const mockListActiveProductions = vi.mocked(getCachedActiveProductions);

const pagePath = path.resolve(
  process.cwd(),
  'app/(main)/(public)/shows/page.tsx'
);

const makeProduction = (index: number): Production =>
  ({
    account_id: `account-${index}`,
    location: 'Chicago, IL',
    production_id: `prod-${index}`,
    production_name: `Show ${String(index).padStart(2, '0')}`
  }) as Production;

// ShowsPage is an async Server Component. Outside the Next.js RSC runtime it
// is still a plain async function — calling it directly and rendering the
// resolved element is the standard way to exercise it under Vitest/RTL (see
// the /roles page test for the same pattern).
const renderPage = async (searchParams: { page?: string } = {}) => {
  const element = await ShowsPage({
    searchParams: Promise.resolve(searchParams)
  });
  return render(element);
};

describe('Shows App Router page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is a Server Component that fetches via the productions service, not a client-side effect', () => {
    expect(existsSync(pagePath)).toBe(true);
    const source = existsSync(pagePath) ? readFileSync(pagePath, 'utf8') : '';

    expect(source.trimStart().startsWith("'use client';")).toBe(false);
    expect(source).not.toMatch(/useEffect|useState/u);
    expect(source).toContain('getCachedActiveProductions');
    expect(source).toContain('export const metadata');
  });

  it('server-renders every show on the first page with no client-side fetch', async () => {
    const productions = Array.from({ length: 5 }, (_, i) => makeProduction(i));
    mockListActiveProductions.mockResolvedValueOnce(productions);

    await renderPage();

    expect(mockListActiveProductions).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Show 00')).toBeInTheDocument();
    expect(screen.getByText('Show 04')).toBeInTheDocument();
  });

  it('renders the empty state when there are no active productions', async () => {
    mockListActiveProductions.mockResolvedValueOnce([]);

    await renderPage();

    expect(
      screen.getByText(
        'No active shows found at this time. Please check back later.'
      )
    ).toBeInTheDocument();
  });

  it('slices to 20 per page and paginates via ?page=', async () => {
    const productions = Array.from({ length: 25 }, (_, i) => makeProduction(i));
    mockListActiveProductions.mockResolvedValueOnce(productions);

    await renderPage({ page: '2' });

    expect(screen.getByText('Show 20')).toBeInTheDocument();
    expect(screen.getByText('Show 24')).toBeInTheDocument();
    expect(screen.queryByText('Show 00')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 21-25 of 25 items')).toBeInTheDocument();
  });

  it('does not throw rendering PublicShowCard outside a react-router Router', async () => {
    // Regression check. PublicShowCard used to link with react-router-dom's
    // <Link>, which throws ("Cannot destructure property 'basename'") without
    // a Router ancestor — and these App Router pages have none. It now uses
    // next/link, so no Router shim is needed. This guards against anything
    // reintroducing a react-router dependency into this render path.
    const productions = [makeProduction(0)];
    mockListActiveProductions.mockResolvedValueOnce(productions);

    await expect(renderPage()).resolves.toBeTruthy();
  });
});
