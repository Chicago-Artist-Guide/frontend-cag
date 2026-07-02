import {
  applyFilters,
  CompanyData,
  CompanySearchFilters,
  isProductionLive
} from './useCompanies';

const baseFilters: CompanySearchFilters = {
  searchTerm: '',
  status: 'all',
  profileComplete: 'all',
  productions: 'all',
  sortBy: 'name',
  sortOrder: 'asc'
};

const makeCompany = (
  overrides: Partial<CompanyData> = {}
): CompanyData => ({
  accountId: 'acct-1',
  uid: 'acct-1',
  theater_name: 'Test Theatre',
  profile_exists: true,
  productions_count: 0,
  live_productions_count: 0,
  ...overrides
});

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

describe('applyFilters — productions', () => {
  const noShows = makeCompany({
    accountId: 'no-shows',
    productions_count: 0,
    live_productions_count: 0
  });
  const someLive = makeCompany({
    accountId: 'some-live',
    productions_count: 2,
    live_productions_count: 1
  });
  const nothingLive = makeCompany({
    accountId: 'nothing-live',
    productions_count: 3,
    live_productions_count: 0
  });
  const companies = [noShows, someLive, nothingLive];

  it('"all" returns every company unchanged', () => {
    expect(applyFilters(companies, baseFilters)).toEqual(companies);
  });

  it('"has_productions" returns only companies with productions_count > 0', () => {
    const result = applyFilters(companies, {
      ...baseFilters,
      productions: 'has_productions'
    });
    expect(result.map((c) => c.accountId).sort()).toEqual([
      'nothing-live',
      'some-live'
    ]);
  });

  it('"no_productions" returns only companies with zero productions', () => {
    const result = applyFilters(companies, {
      ...baseFilters,
      productions: 'no_productions'
    });
    expect(result.map((c) => c.accountId)).toEqual(['no-shows']);
  });

  it('"nothing_live" returns only companies with productions but zero live (the Danztheatre case)', () => {
    const result = applyFilters(companies, {
      ...baseFilters,
      productions: 'nothing_live'
    });
    expect(result.map((c) => c.accountId)).toEqual(['nothing-live']);
  });

  it('composes with the existing search filter', () => {
    const result = applyFilters(companies, {
      ...baseFilters,
      searchTerm: 'test',
      productions: 'nothing_live'
    });
    expect(result.map((c) => c.accountId)).toEqual(['nothing-live']);
  });
});
