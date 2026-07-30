import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock at the service boundary so the Server Component render doesn't hit
// live Firestore. This is the same seam `page.tsx` calls through
// (`getCachedPublicOpenRoles` from `src/services/productions/cached`).
vi.mock('../../../../src/services/productions/cached', () => ({
  getCachedPublicOpenRoles: vi.fn()
}));

import { getCachedPublicOpenRoles } from '../../../../src/services/productions/cached';
import RolesPage from './page';

const mockListRoles = vi.mocked(getCachedPublicOpenRoles);

const pagePath = path.resolve(process.cwd(), 'app/(main)/(public)/roles/page.tsx');

const sampleRoles = [
  {
    account_id: 'a1',
    description: 'A leading role',
    production_id: 'p1',
    production_name: 'Hamlet',
    role_id: 'r1',
    role_name: 'Lead Actor',
    role_status: 'Open' as const,
    type: 'On-Stage' as const
  },
  {
    account_id: 'a2',
    production_id: 'p2',
    production_name: 'Macbeth',
    role_id: 'r2',
    role_name: 'Stage Manager',
    role_status: 'Open' as const,
    type: 'Off-Stage' as const
  }
];

// RolesPage is an async Server Component. Outside the Next.js RSC runtime it
// is still a plain async function — calling it directly and rendering the
// resolved element is the standard way to exercise it under Vitest/RTL.
const renderPage = async () => {
  const element = await RolesPage();
  return render(element);
};

describe('Roles App Router page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is a Server Component that fetches via getCachedPublicOpenRoles, not a client-side effect', () => {
    expect(existsSync(pagePath)).toBe(true);
    const source = existsSync(pagePath) ? readFileSync(pagePath, 'utf8') : '';

    expect(source.trimStart().startsWith("'use client';")).toBe(false);
    expect(source).not.toMatch(/useEffect|useState/u);
    expect(source).toContain('getCachedPublicOpenRoles');
    expect(source).toContain("export const dynamic = 'force-dynamic'");
    expect(source).toContain('export const metadata');
  });

  it('server-renders the full role list with no client-side fetch', async () => {
    mockListRoles.mockResolvedValueOnce(sampleRoles as never);

    await renderPage();

    expect(mockListRoles).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Lead Actor')).toBeInTheDocument();
    expect(screen.getByText('Stage Manager')).toBeInTheDocument();
    expect(screen.getByText('Hamlet')).toBeInTheDocument();
    expect(screen.getByText('Macbeth')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Showing 2 opportunities across 2 productions in Chicago, IL'
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId('public-roles-list')).toBeInTheDocument();
  });

  it('renders the empty-system state when there are no open roles', async () => {
    mockListRoles.mockResolvedValueOnce([]);

    await renderPage();

    expect(screen.getByTestId('public-roles-empty-state')).toBeInTheDocument();
    expect(screen.queryByTestId('public-roles-filters')).not.toBeInTheDocument();
  });

  it('keeps filtering interactive on top of the server-rendered list', async () => {
    mockListRoles.mockResolvedValueOnce(sampleRoles as never);

    await renderPage();

    fireEvent.click(
      screen.getByRole('button', { name: /filter roles, 0 applied/i })
    );

    await screen.findByRole('dialog', { name: /filter roles/i });
    fireEvent.change(screen.getByLabelText(/Filter by role type/i), {
      target: { value: 'Off-Stage' }
    });
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    await waitFor(() => {
      expect(screen.queryByText('Lead Actor')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Stage Manager')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /filter roles, 1 applied/i })
    ).toBeInTheDocument();
  });
});
