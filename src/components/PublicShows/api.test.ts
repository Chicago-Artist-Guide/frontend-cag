import { getDoc, getDocs } from 'firebase/firestore';
import type { Production, Role } from '../Profile/Company/types';
import { fetchPublicOpenRoles } from './api';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn((_store, path, id) => ({ path, id })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn()
}));

const mockGetDocs = vi.mocked(getDocs);
const mockGetDoc = vi.mocked(getDoc);

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

// Theatre name comes from accounts.theater_name (set at company signup).
// The unauth /roles surface deliberately does not read profiles — see
// firestore.rules: profile reads stay auth-gated to protect individual
// artist data, while company accounts are publicly readable.
const setUpTheatreLookup = (accountId: string, theatreName: string) => {
  mockGetDoc.mockImplementation(async (ref: any) => {
    if (ref.path === 'accounts' && ref.id === accountId) {
      return {
        exists: () => true,
        data: () => ({ theater_name: theatreName, type: 'company' })
      } as never;
    }
    return { exists: () => false, data: () => null } as never;
  });
};

describe('fetchPublicOpenRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('flattens open roles across active productions with theatre context', async () => {
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
    setUpTheatreLookup('acct-1', 'Demo Theatre');

    const items = await fetchPublicOpenRoles({} as never);

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      role_id: 'role-1',
      role_name: 'Lead Actor',
      production_id: 'prod-1',
      production_name: 'Demo Production',
      theatre_name: 'Demo Theatre',
      audition_start: '2026-06-01',
      audition_end: '2026-06-15',
      account_id: 'acct-1'
    });
    expect(items[1]).toMatchObject({
      role_id: 'role-2',
      role_name: 'Stage Manager',
      production_id: 'prod-1'
    });
  });

  it('excludes roles with role_status of Closed', async () => {
    const production = buildProduction({}, [
      { role_id: 'open-role', role_status: 'Open', role_name: 'Open Role' },
      { role_id: 'closed-role', role_status: 'Closed', role_name: 'Closed' }
    ]);

    mockGetDocs.mockResolvedValue({
      docs: [{ id: 'prod-1', data: () => production }]
    } as never);
    setUpTheatreLookup('acct-1', 'Demo Theatre');

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
    setUpTheatreLookup('acct-1', 'Demo Theatre');

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

  it('dedupes account reads via the per-call cache (perf contract)', async () => {
    // Two productions sharing the same account_id should produce a single
    // accounts/getDoc — that's the only reason the cache exists.
    const a = buildProduction({ production_id: 'p-a' }, [
      { role_id: 'role-a', role_name: 'A', role_status: 'Open' }
    ]);
    const b = buildProduction({ production_id: 'p-b' }, [
      { role_id: 'role-b', role_name: 'B', role_status: 'Open' }
    ]);

    mockGetDocs.mockResolvedValue({
      docs: [
        { id: 'p-a', data: () => a },
        { id: 'p-b', data: () => b }
      ]
    } as never);
    setUpTheatreLookup('acct-1', 'Shared Theatre');

    await fetchPublicOpenRoles({} as never);

    expect(mockGetDoc).toHaveBeenCalledTimes(1);
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
    setUpTheatreLookup('acct-1', 'Demo Theatre');

    const items = await fetchPublicOpenRoles({} as never);

    expect(items).toHaveLength(1);
    expect(items[0].role_id).toBe('r-valid');
  });
});
