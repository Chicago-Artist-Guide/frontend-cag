'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import PublicRoleCard from '../../../../src/components/PublicShows/PublicRoleCard';
import PublicRolesEmptyState from '../../../../src/components/PublicShows/PublicRolesEmptyState';
import PublicRolesFilters from '../../../../src/components/PublicShows/PublicRolesFilters';
import PublicRolesNoResults from '../../../../src/components/PublicShows/PublicRolesNoResults';
import PublicRolesSignUpCTA from '../../../../src/components/PublicShows/PublicRolesSignUpCTA';
import RolesFilterDrawer from '../../../../src/components/PublicShows/RolesFilterDrawer';
import {
  applyRoleFilters,
  cloneRoleFilters,
  countAppliedFilters,
  createEmptyRoleFilters
} from '../../../../src/components/PublicShows/roleFilters';
import type { RoleFilters } from '../../../../src/components/PublicShows/roleFilters';
import type { PublicRoleListItem } from '../../../../src/services/productions/types';

interface RolesBrowserProps {
  roles: PublicRoleListItem[];
}

// Client-owned filter/drawer state layered on top of a role list that's
// already been rendered on the server (see page.tsx). The full list and its
// markup exist in the initial HTML for crawlers and first paint; this
// component only narrows what's visible in response to user interaction,
// mirroring the filtering behaviour of the legacy `src/routes/PublicRoles.tsx`
// client route (loading/error states from that route don't apply here since
// there's no client-side fetch to fail).
const RolesBrowser: React.FC<RolesBrowserProps> = ({ roles }) => {
  const [appliedFilters, setAppliedFilters] =
    useState<RoleFilters>(createEmptyRoleFilters);
  const [draftFilters, setDraftFilters] =
    useState<RoleFilters>(createEmptyRoleFilters);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);

  const filteredRoles = useMemo(
    () => applyRoleFilters(roles, appliedFilters),
    [appliedFilters, roles]
  );

  const appliedFilterCount = useMemo(
    () => countAppliedFilters(appliedFilters),
    [appliedFilters]
  );

  const filteredProductionCount = useMemo(
    () => new Set(filteredRoles.map((role) => role.production_id)).size,
    [filteredRoles]
  );

  const clearFilters = useCallback(() => {
    setAppliedFilters(createEmptyRoleFilters());
    setDraftFilters(createEmptyRoleFilters());
  }, []);

  const closeFilterDrawer = useCallback(() => {
    setFilterDrawerOpen(false);
  }, []);

  const openFilterDrawer = useCallback(() => {
    setDraftFilters(cloneRoleFilters(appliedFilters));
    setFilterDrawerOpen(true);
  }, [appliedFilters]);

  const applyDraftFilters = useCallback(() => {
    setAppliedFilters(cloneRoleFilters(draftFilters));
    setFilterDrawerOpen(false);
  }, [draftFilters]);

  const clearDraftFilters = useCallback(() => {
    setDraftFilters(createEmptyRoleFilters());
  }, []);

  const renderBody = () => {
    // DEV-495: nothing in the system at all.
    if (roles.length === 0) {
      return <PublicRolesEmptyState />;
    }

    // DEV-494: roles exist but filters wipe them out.
    if (filteredRoles.length === 0) {
      return <PublicRolesNoResults onClearFilters={clearFilters} />;
    }

    return (
      <>
        <p className="mb-4 font-montserrat text-sm text-grayishBlue">
          Showing {filteredRoles.length}{' '}
          {filteredRoles.length === 1 ? 'opportunity' : 'opportunities'} across{' '}
          {filteredProductionCount}{' '}
          {filteredProductionCount === 1 ? 'production' : 'productions'} in
          Chicago, IL
        </p>
        <div data-testid="public-roles-list">
          {filteredRoles.map((role, index) => (
            <PublicRoleCard
              auditionEnd={role.audition_end}
              auditionStart={role.audition_start}
              key={`${role.production_id}-${role.role_id || 'role'}-${index}`}
              productionId={role.production_id}
              productionName={role.production_name}
              role={role}
            />
          ))}
        </div>
        {/* Bottom CTA — reinforces sign-up after the visitor has scanned
            the full list. Uses the lighter 'inline' variant so it reads as
            a natural end-of-list nudge rather than a competing banner. */}
        <PublicRolesSignUpCTA
          body="Create a free profile so theatres can find you when they're casting."
          className="mt-6"
          heading="See a role that excites you?"
          variant="inline"
        />
      </>
    );
  };

  return (
    <>
      {/* Sign-up CTA appears above the list whenever we have roles to show.
          The empty-system null state has its own embedded CTA so we don't
          double up. The 'banner' variant uses the cornflower brand block so
          it's clearly distinct from role cards below. */}
      {roles.length > 0 && <PublicRolesSignUpCTA variant="banner" />}

      {/* Filters are shown whenever there's at least one role in the
          system, otherwise filtering is meaningless. */}
      {roles.length > 0 && (
        <PublicRolesFilters
          appliedCount={appliedFilterCount}
          onOpen={openFilterDrawer}
          triggerRef={filterTriggerRef}
        />
      )}

      {roles.length > 0 && (
        <RolesFilterDrawer
          draft={draftFilters}
          onApply={applyDraftFilters}
          onChange={setDraftFilters}
          onClear={clearDraftFilters}
          onClose={closeFilterDrawer}
          open={filterDrawerOpen}
        />
      )}

      {renderBody()}
    </>
  );
};

export default RolesBrowser;
