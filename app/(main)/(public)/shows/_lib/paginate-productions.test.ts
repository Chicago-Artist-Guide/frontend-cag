import { describe, expect, it } from 'vitest';
import type { Production } from '../../../../../src/components/Profile/Company/types';
import {
  SHOWS_PER_PAGE,
  paginateProductions,
  parsePageParam
} from './paginate-productions';

const makeProduction = (index: number): Production =>
  ({
    account_id: `account-${index}`,
    location: 'Chicago, IL',
    production_id: `prod-${index}`,
    production_name: `Show ${index}`
  }) as Production;

describe('parsePageParam', () => {
  it('defaults to 1 when the value is missing', () => {
    expect(parsePageParam(undefined)).toBe(1);
  });

  it('defaults to 1 for non-numeric input', () => {
    expect(parsePageParam('not-a-number')).toBe(1);
  });

  it('defaults to 1 for zero or negative input', () => {
    expect(parsePageParam('0')).toBe(1);
    expect(parsePageParam('-5')).toBe(1);
  });

  it('parses a valid page number', () => {
    expect(parsePageParam('3')).toBe(3);
  });

  it('truncates fractional input', () => {
    expect(parsePageParam('2.9')).toBe(2);
  });
});

describe('paginateProductions', () => {
  it('returns 1 total page and all items when the list fits on one page', () => {
    const productions = Array.from({ length: 5 }, (_, i) => makeProduction(i));

    const result = paginateProductions(productions, 1);

    expect(result.totalPages).toBe(1);
    expect(result.currentPage).toBe(1);
    expect(result.pageItems).toHaveLength(5);
  });

  it('slices SHOWS_PER_PAGE items per page', () => {
    const productions = Array.from(
      { length: SHOWS_PER_PAGE * 2 + 5 },
      (_, i) => makeProduction(i)
    );

    const firstPage = paginateProductions(productions, 1);
    const secondPage = paginateProductions(productions, 2);
    const thirdPage = paginateProductions(productions, 3);

    expect(firstPage.totalPages).toBe(3);
    expect(firstPage.pageItems).toHaveLength(SHOWS_PER_PAGE);
    expect(firstPage.pageItems[0].production_id).toBe('prod-0');

    expect(secondPage.pageItems).toHaveLength(SHOWS_PER_PAGE);
    expect(secondPage.pageItems[0].production_id).toBe(
      `prod-${SHOWS_PER_PAGE}`
    );

    expect(thirdPage.pageItems).toHaveLength(5);
  });

  it('clamps a requested page beyond the end to the last real page', () => {
    const productions = Array.from({ length: 25 }, (_, i) => makeProduction(i));

    const result = paginateProductions(productions, 999);

    expect(result.totalPages).toBe(2);
    expect(result.currentPage).toBe(2);
    expect(result.pageItems).toHaveLength(5);
  });

  it('treats an empty list as a single empty page rather than dividing by zero', () => {
    const result = paginateProductions([], 1);

    expect(result.totalPages).toBe(1);
    expect(result.currentPage).toBe(1);
    expect(result.pageItems).toHaveLength(0);
  });
});
