import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

interface PublicRolesFiltersProps {
  appliedCount: number;
  onOpen: () => void;
  triggerRef?: React.Ref<HTMLButtonElement>;
}

const PublicRolesFilters: React.FC<PublicRolesFiltersProps> = ({
  appliedCount,
  onOpen,
  triggerRef
}) => {
  return (
    <div className="mb-6 mt-8" data-testid="public-roles-filters">
      <button
        aria-label={`Filter roles, ${appliedCount} applied`}
        className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-cornflower px-5 font-montserrat text-sm font-bold uppercase tracking-[0.12em] text-white shadow-md transition-colors hover:bg-darkGreyBlue focus:outline-none focus:ring-2 focus:ring-cornflower focus:ring-offset-2"
        onClick={onOpen}
        ref={triggerRef}
        type="button"
      >
        <span>Filter Roles</span>
        <span className="font-medium normal-case tracking-[0.02em]">
          ({appliedCount} applied)
        </span>
        <FontAwesomeIcon icon={faFilter} />
      </button>
    </div>
  );
};

export default PublicRolesFilters;
