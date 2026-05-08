import { getDocs } from 'firebase/firestore';
import type { Production, Role } from '../components/Profile/Company/types';
import { fetchPublicOpenRoles } from '../components/PublicShows/api';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn()
}));

const mockGetDocs = vi.mocked(getDocs);

const buildProduction = (
  overrides: Partial<Production> = {},
  roles: Role[] = []
): Production => ({
  account_id: 'acct-1',
  production_id: 'prod-1',
  production_name: 'Demo Production',
  status: 'Casting',
  location: 'Chicago',
  audition_start: '2026-06-01',
  audition_end: '2026-06-15',
  roles,
  ...overrides
});

describe('fetchPublicOpenRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('flattens open roles across active productions with production context', async () => {
    const production = buildProduction({}, [
      {
        role_id: 'role-1',
        role_name: 'Lead Actor',
        type: 'On-Stage',
        role_status: 'Open',
        description: 'A leading role'
      },
      {
        role_id: 'role-2',
        role_name: 'Stage Manager',
        type: 'Off-Stage',
        role_status: 'Open'
      }
    ]);

    mockGetDocs.mockResolvedValue({
      docs: [{ id: 'prod-1', data: () => production }]
    } as never);

    const items = await fetchPublicOpenRoles({} as never);

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      role_id: 'role-1',
      role_name: 'Lead Actor',
      production_id: 'prod-1',
      production_name: 'Demo Production',
      audition_start: '2026-06-01',
      audition_end: '2026-06-15',
      account_id: 'acct-1'
    });
    expect(items[1]).toMatchObject({
      role_id: 'role-2',
      role_name: 'Stage Manager',
      production_id: 'prod-1'
    });
    // Theatre attribution is intentionally absent on the unauth surface;
    // see the comment in PublicShows/api.ts about the email leak.
    expect(items[0]).not.toHaveProperty('theatre_name');
  });

  it('does not read accounts or profiles (rule-deny safety)', async () => {
    // The unauth /roles page must not trigger any account/profile reads —
    // those are auth-gated and would surface as console errors. Only the
    // productions query should be issued.
    const production = buildProduction({}, [
      { role_id: 'r1', role_name: 'A', role_status: 'Open' }
    ]);
    mockGetDocs.mockResolvedValue({
      docs: [{ id: 'prod-1', data: () => production }]
    } as never);

    await fetchPublicOpenRoles({} as never);

    expect(mockGetDocs).toHaveBeenCalledTimes(1);
  });

  it('excludes roles with role_status of Closed', async () => {
    const production = buildProduction({}, [
      { role_id: 'open-role', role_status: 'Open', role_name: 'Open Role' },
      { role_id: 'closed-role', role_status: 'Closed', role_name: 'Closed' }
    ]);

    mockGetDocs.mockResolvedValue({
      docs: [{ id: 'prod-1', data: () => production }]
    } as never);

    const items = await fetchPublicOpenRoles({} as never);

    expect(items).toHaveLength(1);
    expect(items[0].role_id).toBe('open-role');
  });

  it('includes roles missing role_status (treated as open)', async () => {
    const production = buildProduction({}, [
      { role_id: 'no-status', role_name: 'Mystery Role' }
    ]);

    mockGetDocs.mockResolvedValue({
      docs: [{ id: 'prod-1', data: () => production }]
    } as never);

    const items = await fetchPublicOpenRoles({} as never);

    expect(items).toHaveLength(1);
    expect(items[0].role_id).toBe('no-status');
  });

  it('returns an empty list when no productions are returned', async () => {
    mockGetDocs.mockResolvedValue({ docs: [] } as never);

    const items = await fetchPublicOpenRoles({} as never);

    expect(items).toEqual([]);
  });

  it('skips productions that have no roles array', async () => {
    const production = buildProduction({ roles: undefined });
    mockGetDocs.mockResolvedValue({
      docs: [{ id: 'prod-1', data: () => production }]
    } as never);

    const items = await fetchPublicOpenRoles({} as never);

    expect(items).toEqual([]);
  });

  it('filters out productions missing required identity fields', async () => {
    const valid = buildProduction({}, [
      { role_id: 'r-valid', role_name: 'Valid', role_status: 'Open' }
    ]);
    const invalid = buildProduction(
      { production_id: 'prod-2', account_id: '', production_name: 'No Acct' },
      [{ role_id: 'r-invalid', role_name: 'Invalid', role_status: 'Open' }]
    );

    mockGetDocs.mockResolvedValue({
      docs: [
        { id: 'prod-1', data: () => valid },
        { id: 'prod-2', data: () => invalid }
      ]
    } as never);

    const items = await fetchPublicOpenRoles({} as never);

    expect(items).toHaveLength(1);
    expect(items[0].role_id).toBe('r-valid');
  });
});
