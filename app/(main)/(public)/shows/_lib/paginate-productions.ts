import type { Production } from '../../../../../src/components/Profile/Company/types';

// Matches the legacy client route's page size (src/routes/PublicShows.tsx).
export const SHOWS_PER_PAGE = 20;

export interface ProductionsPage {
  currentPage: number;
  pageItems: Production[];
  totalPages: number;
}

// `?page=` is untrusted request input: missing, non-numeric, negative, and
// fractional values all fall back to page 1 rather than producing NaN/invalid
// slices.
export const parsePageParam = (value?: string): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

// `listActiveProductions()` returns the full sorted list — there's no
// Firestore cursor here, so a page is just a slice of that array. A
// requested page past the end clamps to the last real page instead of
// rendering empty.
export const paginateProductions = (
  productions: Production[],
  requestedPage: number
): ProductionsPage => {
  const totalPages = Math.max(
    1,
    Math.ceil(productions.length / SHOWS_PER_PAGE)
  );
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const start = (currentPage - 1) * SHOWS_PER_PAGE;

  return {
    currentPage,
    pageItems: productions.slice(start, start + SHOWS_PER_PAGE),
    totalPages
  };
};
