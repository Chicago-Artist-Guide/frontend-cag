import { TheaterMatchStatus, TheaterTalentMatch } from './types';

export type TheaterTalentMatchRecord =
  | TheaterTalentMatch
  | false
  | null
  | undefined;

/** Whether the theatre has accepted this artist on the match card. */
export const isTheaterAccepted = (match: TheaterTalentMatch): boolean =>
  match.confirmed_by === 'theater' ||
  (match.initiated_by === 'theater' && match.status === true);

/** Whether the theatre has declined this artist on the match card. */
export const isTheaterDeclined = (match: TheaterTalentMatch): boolean =>
  match.rejected_by === 'theater' ||
  (match.initiated_by === 'theater' && match.status === false);

/** Artist applied to the role from their side (Apply, not Hide). */
export const isTalentInterested = (match: TheaterTalentMatch): boolean =>
  match.initiated_by === 'talent' && match.status === true;

/**
 * Status buckets for theatre-side match filters. A profile may belong to
 * multiple buckets (e.g. Interested + Undecided before the theatre acts).
 */
export const getTheaterMatchStatusBuckets = (
  match: TheaterTalentMatchRecord
): Set<TheaterMatchStatus> => {
  const buckets = new Set<TheaterMatchStatus>();

  if (!match) {
    buckets.add('undecided');
    return buckets;
  }

  if (isTheaterAccepted(match)) buckets.add('accepted');
  if (isTheaterDeclined(match)) buckets.add('declined');
  if (isTalentInterested(match)) buckets.add('interested');
  if (!isTheaterAccepted(match) && !isTheaterDeclined(match)) {
    buckets.add('undecided');
  }

  return buckets;
};

/** Accept/decline state shown on the theatre artist match card. */
export const getTheaterCardMatchStatus = (
  match: TheaterTalentMatchRecord
): boolean | null => {
  if (!match) return null;
  if (isTheaterAccepted(match)) return true;
  if (isTheaterDeclined(match)) return false;
  return null;
};

export const profileMatchesTheaterStatusFilters = (
  match: TheaterTalentMatchRecord,
  selected: TheaterMatchStatus[]
): boolean => {
  if (selected.length === 0) return true;
  const buckets = getTheaterMatchStatusBuckets(match);
  return selected.every((s) => buckets.has(s));
};
