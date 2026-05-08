import React from 'react';

interface PublicRolesNoResultsProps {
  onClearFilters: () => void;
}

// DEV-494: shown when filters/search match zero open roles, even though
// roles exist in the system.
const PublicRolesNoResults: React.FC<PublicRolesNoResultsProps> = ({
  onClearFilters
}) => {
  return (
    <div
      className="mt-4 rounded-lg bg-white p-8 text-center shadow"
      data-testid="public-roles-no-results"
    >
      <h2 className="font-montserrat text-xl font-semibold text-darkGrey">
        No matches for these filters
      </h2>
      <p className="mx-auto mt-3 max-w-md font-montserrat text-base text-darkGrey">
        We couldn't find any open roles that match your search. Try clearing
        the filters, broadening your search, or check back later as new roles
        are added regularly.
      </p>
      <button
        className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 font-montserrat text-sm font-bold uppercase tracking-wider text-white shadow-sm hover:bg-darkPrimary"
        onClick={onClearFilters}
        type="button"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default PublicRolesNoResults;
