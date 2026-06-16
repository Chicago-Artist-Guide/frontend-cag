import {
  getTalentRoleStatusBuckets,
  roleMatchesTalentStatusFilters
} from './talentMatchStatus';

describe('artist role match status buckets', () => {
  it('treats no Apply/Hide as undecided only', () => {
    expect(
      getTalentRoleStatusBuckets({ isFavorite: false, matchStatus: null })
    ).toEqual(new Set(['undecided']));
  });

  it('can be favorite and undecided at the same time', () => {
    expect(
      getTalentRoleStatusBuckets({ isFavorite: true, matchStatus: null })
    ).toEqual(new Set(['favorite', 'undecided']));
  });

  it('maps Apply and Hide to applied and hidden buckets', () => {
    expect(
      getTalentRoleStatusBuckets({ isFavorite: false, matchStatus: true })
    ).toEqual(new Set(['applied']));
    expect(
      getTalentRoleStatusBuckets({ isFavorite: false, matchStatus: false })
    ).toEqual(new Set(['hidden']));
  });

  it('uses AND semantics across selected filters', () => {
    const favoritedUndecided = { isFavorite: true, matchStatus: null };
    expect(
      roleMatchesTalentStatusFilters(favoritedUndecided, [
        'favorite',
        'undecided'
      ])
    ).toBe(true);
    expect(
      roleMatchesTalentStatusFilters(favoritedUndecided, [
        'applied',
        'favorite'
      ])
    ).toBe(false);
  });
});
