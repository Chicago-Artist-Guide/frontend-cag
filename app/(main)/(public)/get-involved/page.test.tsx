import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock at the service boundary so the Server Component render doesn't hit
// live Firestore. This is the same seam `page.tsx` calls through
// (`listRoleOpportunities` from src/services/events/roleOpportunities).
// Mock the CACHED module — the seam `page.tsx` actually calls through.
// Mocking the raw module underneath would still execute `unstable_cache`,
// which throws outside the Next request runtime.
vi.mock('../../../../src/services/events/cached', () => ({
  getCachedRoleOpportunities: vi.fn()
}));

// The contact form is a Client Component (Formik + a Firestore write) with
// no bearing on whether this page server-renders correctly — stub it like
// the other client islands in app/(main)/(public)/public-pages.test.tsx.
vi.mock('./contact-form', () => ({
  default: () => <div data-testid="contact-form-client-island" />
}));

import { getCachedRoleOpportunities } from '../../../../src/services/events/cached';
import GetInvolvedPage from './page';

const mockListRoleOpportunities = vi.mocked(getCachedRoleOpportunities);

const pagePath = path.resolve(
  process.cwd(),
  'app/(main)/(public)/get-involved/page.tsx'
);
const contactFormPath = path.resolve(
  process.cwd(),
  'app/(main)/(public)/get-involved/contact-form.tsx'
);

const baseRole = {
  description: 'Description',
  id: 'role-1',
  location: 'Chicago',
  ongoing: false,
  productionId: 'prod-1',
  productionName: 'Demo Production',
  roleName: 'Stage Manager'
};

// GetInvolvedPage is an async Server Component. Outside the Next.js RSC
// runtime it is still a plain async function — calling it directly and
// rendering the resolved element is the standard way to exercise it under
// Vitest/RTL.
const renderPage = async () => {
  const element = await GetInvolvedPage();
  return render(element);
};

describe('Get Involved App Router page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is a Server Component that fetches via listRoleOpportunities, isolating the contact form behind a client boundary', () => {
    expect(existsSync(pagePath)).toBe(true);
    expect(existsSync(contactFormPath)).toBe(true);
    const source = existsSync(pagePath) ? readFileSync(pagePath, 'utf8') : '';
    const contactFormSource = existsSync(contactFormPath)
      ? readFileSync(contactFormPath, 'utf8')
      : '';

    expect(source.trimStart().startsWith("'use client';")).toBe(false);
    expect(source).not.toMatch(/useEffect|useState/u);
    expect(source).toContain('getCachedRoleOpportunities');
    // Must NOT prerender at build time: CI builds with placeholder Firebase
    // config, so a build-time Firestore fetch would either fail the build or
    // silently ship a page containing zero opportunities.
    expect(source).toContain("export const dynamic = 'force-dynamic'");
    expect(source).not.toMatch(/export const revalidate/u);
    expect(source).toContain('export const metadata');
    expect(contactFormSource.trimStart().startsWith("'use client';")).toBe(
      true
    );
  });

  it('server-renders open roles with no client-side fetch', async () => {
    mockListRoleOpportunities.mockResolvedValueOnce([
      { ...baseRole, id: 'role-1', roleName: 'Stage Manager' },
      { ...baseRole, id: 'role-2', roleName: 'Grant Writer' }
    ]);

    await renderPage();

    expect(mockListRoleOpportunities).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Get involved' })
    ).toBeInTheDocument();
    expect(screen.getByText('Stage Manager')).toBeInTheDocument();
    expect(screen.getByText('Grant Writer')).toBeInTheDocument();
    expect(
      screen.getByTestId('contact-form-client-island')
    ).toBeInTheDocument();
  });

  it('shows ongoing roles in a separate section only when present', async () => {
    mockListRoleOpportunities.mockResolvedValueOnce([
      { ...baseRole, id: 'ongoing-1', ongoing: true, roleName: 'Board Member' }
    ]);

    await renderPage();

    expect(
      screen.getByRole('heading', { name: 'Ongoing open positions' })
    ).toBeInTheDocument();
    expect(screen.getByText('Board Member')).toBeInTheDocument();
    expect(
      screen.getByText('No open role opportunities at this time. Check back soon!')
    ).toBeInTheDocument();
  });

  it('omits the ongoing-positions section entirely when there are none', async () => {
    mockListRoleOpportunities.mockResolvedValueOnce([baseRole]);

    await renderPage();

    expect(
      screen.queryByRole('heading', { name: 'Ongoing open positions' })
    ).not.toBeInTheDocument();
  });

  it('caps the current-openings list at 6 roles', async () => {
    mockListRoleOpportunities.mockResolvedValueOnce(
      Array.from({ length: 8 }, (_, index) => ({
        ...baseRole,
        id: `role-${index}`,
        roleName: `Role ${index}`
      }))
    );

    await renderPage();

    for (let index = 0; index < 6; index += 1) {
      expect(screen.getByText(`Role ${index}`)).toBeInTheDocument();
    }
    expect(screen.queryByText('Role 6')).not.toBeInTheDocument();
    expect(screen.queryByText('Role 7')).not.toBeInTheDocument();
  });
});
