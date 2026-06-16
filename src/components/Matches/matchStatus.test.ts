import {
  getTheaterCardMatchStatus,
  getTheaterMatchStatusBuckets,
  profileMatchesTheaterStatusFilters
} from './matchStatus';
import { TheaterTalentMatch } from './types';

const baseMatch = (
  overrides: Partial<TheaterTalentMatch>
): TheaterTalentMatch => ({
  id: 'match-1',
  production_id: 'prod-1',
  role_id: 'role-1',
  talent_account_id: 'talent-1',
  status: true,
  initiated_by: 'theater',
  ...overrides
});

describe('theatre match status buckets', () => {
  it('treats no match as undecided only', () => {
    expect(getTheaterMatchStatusBuckets(false)).toEqual(new Set(['undecided']));
    expect(getTheaterCardMatchStatus(false)).toBeNull();
  });

  it('does not treat a talent Apply as theatre Accepted', () => {
    const match = baseMatch({ initiated_by: 'talent', status: true });
    expect(getTheaterMatchStatusBuckets(match)).toEqual(
      new Set(['interested', 'undecided'])
    );
    expect(getTheaterCardMatchStatus(match)).toBeNull();
  });

  it('treats theatre Accept as accepted', () => {
    const match = baseMatch({
      initiated_by: 'theater',
      status: true
    });
    expect(getTheaterMatchStatusBuckets(match)).toEqual(new Set(['accepted']));
    expect(getTheaterCardMatchStatus(match)).toBe(true);
  });

  it('treats theatre Decline as declined', () => {
    const match = baseMatch({
      initiated_by: 'theater',
      status: false
    });
    expect(getTheaterMatchStatusBuckets(match)).toEqual(new Set(['declined']));
    expect(getTheaterCardMatchStatus(match)).toBe(false);
  });

  it('treats confirmed talent application as accepted and interested', () => {
    const match = baseMatch({
      initiated_by: 'talent',
      status: true,
      confirmed_by: 'theater'
    });
    expect(getTheaterMatchStatusBuckets(match)).toEqual(
      new Set(['accepted', 'interested'])
    );
  });

  it('treats theatre favorites as a separate favorite bucket', () => {
    expect(getTheaterMatchStatusBuckets(false, { isFavorite: true })).toEqual(
      new Set(['favorite', 'undecided'])
    );
    expect(
      profileMatchesTheaterStatusFilters(false, ['favorite'], {
        isFavorite: true
      })
    ).toBe(true);
    expect(
      profileMatchesTheaterStatusFilters(false, ['favorite'], {
        isFavorite: false
      })
    ).toBe(false);
  });

  it('uses AND semantics across selected filter statuses', () => {
    const interestedUndecided = baseMatch({
      initiated_by: 'talent',
      status: true
    });
    expect(
      profileMatchesTheaterStatusFilters(interestedUndecided, [
        'interested',
        'undecided'
      ])
    ).toBe(true);
    expect(
      profileMatchesTheaterStatusFilters(interestedUndecided, [
        'declined',
        'interested'
      ])
    ).toBe(false);
  });
});
