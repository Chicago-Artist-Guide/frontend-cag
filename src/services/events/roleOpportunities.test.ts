import { splitRoleOpportunities } from './roleOpportunities';
import type { RoleOpportunity } from './types';

const firebaseMocks = vi.hoisted(() => ({
  collection: vi.fn(),
  firestore: { type: 'server-firestore' },
  getDocs: vi.fn(),
  getServerFirestore: vi.fn(),
  roleOpportunitiesRef: { path: 'roleOpportunities' }
}));

vi.mock('../../lib/firebase/server', () => ({
  getServerFirestore: firebaseMocks.getServerFirestore
}));

vi.mock('firebase/firestore', () => ({
  collection: firebaseMocks.collection,
  getDocs: firebaseMocks.getDocs
}));

const docSnapshot = (id: string, data: Record<string, unknown>) => ({
  data: () => data,
  id
});

const loadService = () => import('./roleOpportunities');

const makeRole = (overrides: Partial<RoleOpportunity> = {}): RoleOpportunity => ({
  description: 'Description',
  id: 'role-1',
  location: 'Chicago',
  ongoing: false,
  productionId: 'prod-1',
  productionName: 'Demo Production',
  roleName: 'Stage Manager',
  ...overrides
});

describe('listRoleOpportunities', () => {
  beforeEach(() => {
    vi.resetModules();
    for (const mock of Object.values(firebaseMocks)) {
      if (typeof mock === 'function' && 'mockReset' in mock) {
        mock.mockReset();
      }
    }
    firebaseMocks.getServerFirestore.mockReturnValue(firebaseMocks.firestore);
    firebaseMocks.collection.mockReturnValue(firebaseMocks.roleOpportunitiesRef);
  });

  it('reads the roleOpportunities collection with no where/orderBy constraints', async () => {
    firebaseMocks.getDocs.mockResolvedValue({ docs: [] });
    const { listRoleOpportunities } = await loadService();

    await listRoleOpportunities();

    expect(firebaseMocks.collection).toHaveBeenCalledWith(
      firebaseMocks.firestore,
      'roleOpportunities'
    );
    expect(firebaseMocks.getDocs).toHaveBeenCalledWith(
      firebaseMocks.roleOpportunitiesRef
    );
  });

  it('normalizes camelCase fields', async () => {
    firebaseMocks.getDocs.mockResolvedValue({
      docs: [
        docSnapshot('role-1', {
          description: 'Lead the ensemble',
          googleFormUrl: 'https://forms.google.com/a',
          location: 'Evanston',
          ongoing: true,
          productionId: 'prod-1',
          productionName: 'Hamlet',
          roleName: 'Director',
          roleType: 'Offstage'
        })
      ]
    });
    const { listRoleOpportunities } = await loadService();

    const roles = await listRoleOpportunities();

    expect(roles).toEqual([
      {
        description: 'Lead the ensemble',
        googleFormUrl: 'https://forms.google.com/a',
        id: 'role-1',
        location: 'Evanston',
        moreInfoUrl: undefined,
        ongoing: true,
        pay: undefined,
        productionId: 'prod-1',
        productionName: 'Hamlet',
        roleName: 'Director',
        roleType: 'Offstage'
      }
    ]);
  });

  it('falls back to snake_case fields when camelCase is absent', async () => {
    firebaseMocks.getDocs.mockResolvedValue({
      docs: [
        docSnapshot('role-2', {
          description: 'Grant writing',
          google_form_url: 'https://forms.google.com/b',
          more_info_url: 'https://example.com/info',
          production_id: 'prod-2',
          production_name: 'Macbeth',
          role_name: 'Grant Writer',
          role_type: 'Offstage'
        })
      ]
    });
    const { listRoleOpportunities } = await loadService();

    const [role] = await listRoleOpportunities();

    expect(role).toEqual({
      description: 'Grant writing',
      googleFormUrl: 'https://forms.google.com/b',
      id: 'role-2',
      location: 'Chicago',
      moreInfoUrl: 'https://example.com/info',
      ongoing: false,
      pay: undefined,
      productionId: 'prod-2',
      productionName: 'Macbeth',
      roleName: 'Grant Writer',
      roleType: 'Offstage'
    });
  });

  it('defaults location to Chicago when absent', async () => {
    firebaseMocks.getDocs.mockResolvedValue({
      docs: [docSnapshot('role-3', { roleName: 'Volunteer' })]
    });
    const { listRoleOpportunities } = await loadService();

    const [role] = await listRoleOpportunities();

    expect(role.location).toBe('Chicago');
  });

  it('propagates read failures', async () => {
    const failure = new Error('read failed');
    firebaseMocks.getDocs.mockRejectedValue(failure);
    const { listRoleOpportunities } = await loadService();

    await expect(listRoleOpportunities()).rejects.toBe(failure);
  });
});

describe('splitRoleOpportunities', () => {
  it('separates ongoing from temporal roles', () => {
    const roles = [
      makeRole({ id: 'temporal-1', ongoing: false }),
      makeRole({ id: 'ongoing-1', ongoing: true }),
      makeRole({ id: 'temporal-2', ongoing: false })
    ];

    const { ongoing, temporal } = splitRoleOpportunities(roles);

    expect(ongoing.map((role) => role.id)).toEqual(['ongoing-1']);
    expect(temporal.map((role) => role.id)).toEqual([
      'temporal-1',
      'temporal-2'
    ]);
  });

  it('caps the temporal list at 6 while showing every ongoing role', () => {
    const temporalRoles = Array.from({ length: 8 }, (_, index) =>
      makeRole({ id: `temporal-${index}`, ongoing: false })
    );
    const ongoingRoles = Array.from({ length: 3 }, (_, index) =>
      makeRole({ id: `ongoing-${index}`, ongoing: true })
    );

    const { ongoing, temporal } = splitRoleOpportunities([
      ...temporalRoles,
      ...ongoingRoles
    ]);

    expect(temporal).toHaveLength(6);
    expect(temporal.map((role) => role.id)).toEqual([
      'temporal-0',
      'temporal-1',
      'temporal-2',
      'temporal-3',
      'temporal-4',
      'temporal-5'
    ]);
    expect(ongoing).toHaveLength(3);
  });
});
