import React from 'react';

export type StageFilter = 'All' | 'On-Stage' | 'Off-Stage';

interface PublicRolesFiltersProps {
  searchTerm: string;
  stageFilter: StageFilter;
  onSearchChange: (value: string) => void;
  onStageFilterChange: (value: StageFilter) => void;
}

const STAGE_OPTIONS: StageFilter[] = ['All', 'On-Stage', 'Off-Stage'];

const PublicRolesFilters: React.FC<PublicRolesFiltersProps> = ({
  searchTerm,
  stageFilter,
  onSearchChange,
  onStageFilterChange
}) => {
  return (
    <div
      className="mb-6 rounded-lg bg-white p-4 shadow-sm"
      data-testid="public-roles-filters"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label
            className="mb-1 block font-montserrat text-xs font-semibold uppercase tracking-wider text-darkGrey"
            htmlFor="public-roles-search"
          >
            Search
          </label>
          <input
            aria-label="Search roles by name, production, or theatre"
            className="w-full rounded-md border border-lightGrey bg-bodyBg px-3 py-2 font-montserrat text-sm text-darkGrey focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint"
            id="public-roles-search"
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by role, production, or theatre"
            type="text"
            value={searchTerm}
          />
        </div>

        <div>
          <label
            className="mb-1 block font-montserrat text-xs font-semibold uppercase tracking-wider text-darkGrey"
            htmlFor="public-roles-stage-filter"
          >
            Stage Type
          </label>
          <select
            aria-label="Filter by stage type"
            className="w-full rounded-md border border-lightGrey bg-bodyBg px-3 py-2 font-montserrat text-sm text-darkGrey focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint md:w-48"
            id="public-roles-stage-filter"
            onChange={(e) => onStageFilterChange(e.target.value as StageFilter)}
            value={stageFilter}
          >
            {STAGE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default PublicRolesFilters;
