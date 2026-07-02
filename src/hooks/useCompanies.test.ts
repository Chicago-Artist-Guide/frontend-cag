import { isProductionLive } from './useCompanies';

describe('isProductionLive', () => {
  it('is false when status is not active (e.g. In Production)', () => {
    expect(
      isProductionLive({
        status: 'In Production',
        roles: [{ role_status: 'Open' }]
      })
    ).toBe(false);
  });

  it('is false when status is missing', () => {
    expect(isProductionLive({ roles: [{ role_status: 'Open' }] })).toBe(false);
  });

  it('is false when status is active but roles is empty (the Danztheatre case)', () => {
    expect(isProductionLive({ status: 'Hiring', roles: [] })).toBe(false);
  });

  it('is false when status is active but roles is missing entirely', () => {
    expect(isProductionLive({ status: 'Hiring' })).toBe(false);
  });

  it('is false when status is active but every role is Closed', () => {
    expect(
      isProductionLive({
        status: 'Hiring',
        roles: [{ role_status: 'Closed' }, { role_status: 'Closed' }]
      })
    ).toBe(false);
  });

  it('is true when status is active and at least one role is Open', () => {
    expect(
      isProductionLive({
        status: 'Hiring',
        roles: [{ role_status: 'Closed' }, { role_status: 'Open' }]
      })
    ).toBe(true);
  });

  it('is true when status is active and a role has no role_status set (treated as open)', () => {
    expect(
      isProductionLive({
        status: 'Casting',
        roles: [{}]
      })
    ).toBe(true);
  });

  it('is true for each of the three active statuses', () => {
    for (const status of ['Hiring', 'Casting', 'Pre-Production']) {
      expect(isProductionLive({ status, roles: [{ role_status: 'Open' }] })).toBe(
        true
      );
    }
  });

  it('is false when admin_hidden is true, even with active status and an open role', () => {
    expect(
      isProductionLive({
        status: 'Hiring',
        roles: [{ role_status: 'Open' }],
        admin_hidden: true
      })
    ).toBe(false);
  });

  it('is true when admin_hidden is explicitly false', () => {
    expect(
      isProductionLive({
        status: 'Hiring',
        roles: [{ role_status: 'Open' }],
        admin_hidden: false
      })
    ).toBe(true);
  });
});
