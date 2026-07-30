'use client';

import React from 'react';
import Link from 'next/link';

interface PublicRolesNoResultsProps {
  onClearFilters: () => void;
}

// DEV-494: shown when filters/search match zero open roles, even though
// roles exist in the system. Distinct from DEV-495 (PublicRolesEmptyState)
// which handles the case where there are no roles at all.
const PublicRolesNoResults: React.FC<PublicRolesNoResultsProps> = ({
  onClearFilters
}) => {
  return (
    <div
      className="mt-4 rounded-lg bg-white p-8 text-center shadow"
      data-testid="public-roles-no-results"
    >
      <h2 className="font-montserrat text-xl font-semibold text-darkGrey">
        No roles match your filters
      </h2>
      <p className="mx-auto mt-3 max-w-md font-montserrat text-base text-grayishBlue">
        There are open roles in the system, but none match your current filters.
        Try broadening your selections or clearing all filters to see every
        available opportunity.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          aria-label="Clear all active filters and show all roles"
          // bg-darkPrimary on white -> 7.4:1 contrast (AAA). The previous
          // bg-mint on white was 2.39:1 (failed AA).
          className="inline-flex items-center justify-center rounded-full bg-darkPrimary px-6 py-2 font-montserrat text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-cornflower focus:outline-none focus:ring-2 focus:ring-darkPrimary focus:ring-offset-2"
          onClick={onClearFilters}
          type="button"
        >
          Clear Filters
        </button>
        <Link
          aria-label="Sign up to receive notifications when new roles are posted"
          // text-darkPrimary on white -> 7.4:1 (AAA). text-mint was 2.39:1.
          className="inline-flex items-center justify-center rounded-full border border-darkPrimary px-6 py-2 font-montserrat text-sm font-bold uppercase tracking-wider text-darkPrimary transition-colors hover:bg-darkPrimary hover:text-white focus:outline-none focus:ring-2 focus:ring-darkPrimary focus:ring-offset-2"
          data-testid="no-results-signup-link"
          href="/sign-up"
        >
          Sign Up for Notifications
        </Link>
      </div>
    </div>
  );
};

export default PublicRolesNoResults;
