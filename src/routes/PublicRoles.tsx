import React, { useEffect, useMemo, useState } from 'react';
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
import type { StageFilter } from '../components/PublicShows/PublicRolesFilters';
import PublicRolesNoResults from '../components/PublicShows/PublicRolesNoResults';
import PublicRolesSignUpCTA from '../components/PublicShows/PublicRolesSignUpCTA';

// Roles list page (DEV-496/494/495/497/498). Renders every Open role
// across active productions, lets unauth visitors filter, and offers a
// sign-up CTA for notification when new roles are posted.
const PublicRoles = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const [roles, setRoles] = useState<PublicRoleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<StageFilter>('All');

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

  const filteredRoles = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();

    return roles.filter((r) => {
      if (stageFilter !== 'All' && r.type !== stageFilter) {
        return false;
      }

      if (needle.length > 0) {
        const haystack = [r.role_name, r.offstage_role, r.production_name]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(needle)) {
          return false;
        }
      }

      return true;
    });
  }, [roles, searchTerm, stageFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStageFilter('All');
  };

  const hasActiveFilters =
    searchTerm.trim().length > 0 || stageFilter !== 'All';

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
          Showing {filteredRoles.length}
          {hasActiveFilters ? ` of ${roles.length}` : ''} open{' '}
          {filteredRoles.length === 1 ? 'role' : 'roles'}
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
              onSearchChange={setSearchTerm}
              onStageFilterChange={setStageFilter}
              searchTerm={searchTerm}
              stageFilter={stageFilter}
            />
          )}

          {renderBody()}
        </Col>
      </Row>
    </PageContainer>
  );
};

export default PublicRoles;
