import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';

interface ShowsPaginationProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

type PageEntry = number | 'ellipsis';

// Mirrors src/components/shared/Pagination.tsx's page-number windowing
// (current page +/- 1, with the first/last page always pinned and an
// ellipsis filling any gap) so the visible control is unchanged. That
// component takes an imperative `onPageChange` callback with no href, which
// doesn't fit a server-rendered, URL-addressable `?page=` list — this is a
// small from-scratch equivalent built with real `<Link>`s instead, so the
// page numbers are crawlable and no client JS is needed just to paginate.
const getVisiblePages = (
  currentPage: number,
  totalPages: number
): PageEntry[] => {
  const delta = 1;
  const pages: PageEntry[] = [];

  if (currentPage > delta + 1) {
    pages.push(1);
    if (currentPage > delta + 2) {
      pages.push('ellipsis');
    }
  }

  const rangeStart = Math.max(1, currentPage - delta);
  const rangeEnd = Math.min(totalPages, currentPage + delta);
  for (let page = rangeStart; page <= rangeEnd; page += 1) {
    pages.push(page);
  }

  if (currentPage < totalPages - delta) {
    if (currentPage < totalPages - delta - 1) {
      pages.push('ellipsis');
    }
    pages.push(totalPages);
  }

  return pages;
};

const hrefForPage = (page: number): string =>
  page <= 1 ? '/shows' : `/shows?page=${page}`;

const navButtonClass =
  'border-r border-lightGrey px-[18px] py-3 font-montserrat text-sm font-medium last:border-r-0';

const ShowsPagination: React.FC<ShowsPaginationProps> = ({
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages
}) => {
  if (totalItems <= itemsPerPage) {
    return null;
  }

  const firstItem = (currentPage - 1) * itemsPerPage + 1;
  const lastItem = Math.min(currentPage * itemsPerPage, totalItems);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="mb-5 mt-[30px] flex flex-col items-center">
      <div className="mb-[15px] flex overflow-hidden rounded-lg border border-lightGrey bg-white shadow-sm">
        {currentPage === 1 ? (
          <span className={clsx(navButtonClass, 'cursor-not-allowed text-lightGrey')}>
            &lt;Previous
          </span>
        ) : (
          <Link
            className={clsx(navButtonClass, 'text-grayishBlue hover:bg-lightestGrey hover:text-mint')}
            href={hrefForPage(currentPage - 1)}
          >
            &lt;Previous
          </Link>
        )}

        {visiblePages.map((page, index) =>
          page === 'ellipsis' ? (
            <div
              className="flex min-w-[50px] items-center justify-center border-r border-lightGrey px-[15px] py-3 font-montserrat text-grayishBlue last:border-r-0"
              key={`ellipsis-${index}`}
            >
              ...
            </div>
          ) : (
            <Link
              className={clsx(
                'min-w-[50px] border-r border-lightGrey px-[18px] py-3 text-center font-montserrat text-sm last:border-r-0',
                page === currentPage
                  ? 'bg-mint font-semibold text-white'
                  : 'font-medium text-grayishBlue hover:bg-lightestGrey hover:text-mint'
              )}
              href={hrefForPage(page)}
              key={`page-${page}`}
            >
              {page}
            </Link>
          )
        )}

        {currentPage === totalPages ? (
          <span className={clsx(navButtonClass, 'cursor-not-allowed text-lightGrey')}>
            &gt;Next
          </span>
        ) : (
          <Link
            className={clsx(navButtonClass, 'text-grayishBlue hover:bg-lightestGrey hover:text-mint')}
            href={hrefForPage(currentPage + 1)}
          >
            &gt;Next
          </Link>
        )}
      </div>

      <div className="mt-3 text-center font-montserrat text-[15px] font-medium text-grayishBlue">
        Showing {firstItem}-{lastItem} of {totalItems} items
      </div>
    </div>
  );
};

export default ShowsPagination;
