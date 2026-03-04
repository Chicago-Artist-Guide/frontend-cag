import { getDocs } from 'firebase/firestore';
import type { Production, Role } from '../Profile/Company/types';
import type { IndividualProfileDataFullInit } from '../SignUp/Individual/types';
import { fetchRolesForTalent } from './api';

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  limit: vi.fn(),
  query: vi.fn(),
  updateDoc: vi.fn(),
  where: vi.fn()
}));

const mockGetDocs = vi.mocked(getDocs);

const buildProduction = (roleOverrides: Partial<Role> = {}): Production => ({
  account_id: 'theater-account-1',
  production_id: 'production-1',
  production_name: 'Demo Production',
  status: 'Casting',
  location: 'Chicago',
  roles: [
    {
      role_id: 'role-1',
      type: 'On-Stage',
      gender_identity: ['Woman'],
      ethnicity: ['Asian'],
      lgbtq_only: true,
      ...roleOverrides
    }
  ]
});

const baseProfile = {
  stage_role: 'on-stage',
  ethnicities: ['Asian'],
  gender_identity: 'Cis Woman',
  gender_roles: [],
  age_ranges: [],
  lgbtqia: 'Yes',
  additional_skills_checkboxes: [],
  union_status: []
} as unknown as IndividualProfileDataFullInit;

describe('fetchRolesForTalent matching criteria', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps LGBTQ+, gender, and ethnicity role filtering active for matching', async () => {
    const production = buildProduction();
    mockGetDocs.mockResolvedValue({
      docs: [{ data: () => production }]
    } as never);

    const roles = await fetchRolesForTalent({} as never, baseProfile);

    expect(roles).toHaveLength(1);
    expect(roles[0].role_id).toBe('role-1');
    expect(roles[0].productionId).toBe('production-1');
  });

  it('excludes roles when LGBTQ+ requirement is not satisfied', async () => {
    const production = buildProduction();
    mockGetDocs.mockResolvedValue({
      docs: [{ data: () => production }]
    } as never);

    const roles = await fetchRolesForTalent({} as never, {
      ...baseProfile,
      lgbtqia: 'No'
    });

    expect(roles).toHaveLength(0);
  });
});
