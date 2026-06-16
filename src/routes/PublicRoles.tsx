import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { Col, Row } from 'react-bootstrap';
import { PageContainer } from '../components/layout';
import { Tagline, Title } from '../components/layout/Titles';
import { useFirebaseContext } from '../context/FirebaseContext';
import { fetchPublicOpenRoles } from '../components/PublicShows/api';
import type { PublicRoleListItem } from '../components/PublicShows/api';
import PublicRoleCard from '../components/PublicShows/PublicRoleCard';
import PublicRoleCardSkeleton from '../components/PublicShows/PublicRoleCardSkeleton';
import PublicRolesEmptyState from '../components/PublicShows/PublicRolesEmptyState';
import PublicRolesFilters from '../components/PublicShows/PublicRolesFilters';
import PublicRolesNoResults from '../components/PublicShows/PublicRolesNoResults';
import PublicRolesSignUpCTA from '../components/PublicShows/PublicRolesSignUpCTA';
import RolesFilterDrawer from '../components/PublicShows/RolesFilterDrawer';
import {
  applyRoleFilters,
  cloneRoleFilters,
  countAppliedFilters,
  createEmptyRoleFilters
} from '../components/PublicShows/roleFilters';
import type { RoleFilters } from '../components/PublicShows/roleFilters';

// Roles list page (DEV-496/494/495/497/498). Renders every Open role
// across active productions, lets unauth visitors filter, and offers a
// sign-up CTA for notification when new roles are posted.
const PublicRoles = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const [roles, setRoles] = useState<PublicRoleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [appliedFilters, setAppliedFilters] =
    useState<RoleFilters>(createEmptyRoleFilters);
  const [draftFilters, setDraftFilters] =
    useState<RoleFilters>(createEmptyRoleFilters);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setHasError(false);
        const items = await fetchPublicOpenRoles(firebaseFirestore);
        if (!isMounted) return;
        setRoles(items);
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load public roles', err);
          setRoles([]);
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [firebaseFirestore]);

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

  const hasActiveFilters = appliedFilterCount > 0;

  const renderBody = () => {
    if (loading) {
      return (
        <div className="mt-[1rem]">
          <PublicRoleCardSkeleton />
          <PublicRoleCardSkeleton />
          <PublicRoleCardSkeleton />
        </div>
      );
    }

    // Distinguish a real load failure from "system is empty" — the empty
    // copy ("check back soon") is misleading when the issue is actually a
    // network or rules error.
    if (hasError) {
      return (
        <div
          className="mt-6 rounded border border-salmon/30 bg-salmon/5 p-6 text-center font-montserrat text-sm text-grayishBlue"
          data-testid="public-roles-error"
          role="alert"
        >
          <p className="mb-2 font-semibold text-salmon">
            Couldn&apos;t load roles right now.
          </p>
          <p>Please refresh the page or try again in a moment.</p>
        </div>
      );
    }

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
    <PageContainer>
      <Row>
        <Col lg={12}>
          <Title>OPEN THEATRE ROLES</Title>
          <Tagline>
            Browse every open audition and crew opportunity in Chicago theatre
          </Tagline>

          {/* Sign-up CTA appears above the list whenever we have roles to
              show. The empty-system null state has its own embedded CTA so
              we don't double up. The 'banner' variant uses the cornflower
              brand block so it's clearly distinct from role cards below. */}
          {!loading && roles.length > 0 && (
            <PublicRolesSignUpCTA variant="banner" />
          )}

          {/* Filters are shown whenever there's at least one role in the
              system, otherwise filtering is meaningless. */}
          {!loading && roles.length > 0 && (
            <PublicRolesFilters
              appliedCount={appliedFilterCount}
              onOpen={openFilterDrawer}
              triggerRef={filterTriggerRef}
            />
          )}

          {!loading && roles.length > 0 && (
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
        </Col>
      </Row>
    </PageContainer>
  );
};

export default PublicRoles;
