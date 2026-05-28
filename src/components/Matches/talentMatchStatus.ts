import { TalentMatchStatus } from './types';

export type TalentRoleState = {
  isFavorite: boolean;
  matchStatus: boolean | null;
};

/**
 * Status buckets for artist-side role filters. Favorite is independent of
 * Apply/Hide; undecided means neither Apply nor Hide has been selected.
 */
export const getTalentRoleStatusBuckets = (
  state: TalentRoleState | undefined
): Set<TalentMatchStatus> => {
  const buckets = new Set<TalentMatchStatus>();

  if (state?.matchStatus === true) buckets.add('applied');
  if (state?.matchStatus === false) buckets.add('hidden');
  if (state?.isFavorite) buckets.add('favorite');
  if (!state || state.matchStatus === null || state.matchStatus === undefined) {
    buckets.add('undecided');
  }

  return buckets;
};

export const roleMatchesTalentStatusFilters = (
  state: TalentRoleState | undefined,
  selected: TalentMatchStatus[]
): boolean => {
  if (selected.length === 0) return true;
  const buckets = getTalentRoleStatusBuckets(state);
  return selected.every((s) => buckets.has(s));
};
