import type { PublicRoleListItem } from './api';
import {
  applyRoleFilters,
  countAppliedFilters,
  createEmptyRoleFilters
} from './roleFilters';
import type { RoleFilters } from './roleFilters';

const makeRole = (
  overrides: Partial<PublicRoleListItem> = {}
): PublicRoleListItem =>
  ({
    account_id: 'account-1',
    production_id: 'production-1',
    production_name: 'Test Production',
    role_id: 'role-1',
    role_name: 'Test Role',
    role_status: 'Open',
    type: 'On-Stage',
    ...overrides
  }) as PublicRoleListItem;

const makeFilters = (overrides: Partial<RoleFilters> = {}): RoleFilters => ({
  ...createEmptyRoleFilters(),
  ...overrides
});

describe('roleFilters', () => {
  it('returns every role when no filters are active', () => {
    const roles = [
      makeRole({ role_id: 'r1' }),
      makeRole({ role_id: 'r2', type: 'Off-Stage' })
    ];

    expect(applyRoleFilters(roles, createEmptyRoleFilters())).toEqual(roles);
  });

  it('filters by role type', () => {
    const roles = [
      makeRole({ role_id: 'r1', type: 'On-Stage' }),
      makeRole({ role_id: 'r2', type: 'Off-Stage' })
    ];

    expect(
      applyRoleFilters(roles, makeFilters({ roleType: 'Off-Stage' }))
    ).toEqual([roles[1]]);
  });

  it('uses OR within a section and AND across sections', () => {
    const roles = [
      makeRole({
        role_id: 'r1',
        age_range: ['18-22'],
        gender_identity: ['Woman']
      }),
      makeRole({
        role_id: 'r2',
        age_range: ['23-27'],
        gender_identity: ['Man']
      }),
      makeRole({
        role_id: 'r3',
        age_range: ['33-37'],
        gender_identity: ['Woman']
      })
    ];

    expect(
      applyRoleFilters(
        roles,
        makeFilters({
          ageRanges: ['18-22', '23-27'],
          genders: ['Woman', 'Man']
        })
      )
    ).toEqual([roles[0], roles[1]]);
  });

  it('keeps open-to-all matching literal', () => {
    const roles = [
      makeRole({
        role_id: 'r1',
        gender_identity: ['Open to all genders']
      }),
      makeRole({ role_id: 'r2', gender_identity: ['Man'] })
    ];

    expect(
      applyRoleFilters(roles, makeFilters({ genders: ['Man'] }))
    ).toEqual([roles[1]]);

    expect(
      applyRoleFilters(
        roles,
        makeFilters({ genders: ['Open to all genders'] })
      )
    ).toEqual([roles[0]]);
  });

  it('matches legacy and trans/nonbinary gender storage', () => {
    const roles = [
      makeRole({
        include_nonbinary: true,
        role_id: 'r1',
        gender_identity: ['Woman']
      }),
      makeRole({
        role_id: 'r2',
        gender_identity: ['Trans/Nonbinary'],
        trans_nonbinary_roles: ['Man']
      })
    ];

    expect(
      applyRoleFilters(roles, makeFilters({ genders: ['Nonbinary'] }))
    ).toEqual([roles[0]]);

    expect(
      applyRoleFilters(roles, makeFilters({ genders: ['Man'] }))
    ).toEqual([roles[1]]);
  });

  it('expands ethnicity values for matching', () => {
    const roles = [
      makeRole({
        ethnicity: ['East Asian (ex. China, Korea, Japan)'],
        role_id: 'r1'
      }),
      makeRole({
        ethnicity: ['White'],
        role_id: 'r2'
      })
    ];

    expect(
      applyRoleFilters(roles, makeFilters({ ethnicities: ['Asian'] }))
    ).toEqual([roles[0]]);
  });

  it('filters pay bounds and excludes missing rates when pay is active', () => {
    const roles = [
      makeRole({ role_id: 'r1', role_rate: 50 }),
      makeRole({
        role_id: 'r2',
        role_rate: '$600' as unknown as number
      }),
      makeRole({ role_id: 'r3' })
    ];

    expect(
      applyRoleFilters(roles, makeFilters({ payMin: 100, payMax: 700 }))
    ).toEqual([roles[1]]);
  });

  it('counts selected values and pay as one applied filter', () => {
    expect(
      countAppliedFilters(
        makeFilters({
          ageRanges: ['18-22', '23-27', '28-32'],
          genders: ['Open to all genders'],
          payMin: 100,
          roleType: 'On-Stage'
        })
      )
    ).toBe(6);
  });
});
