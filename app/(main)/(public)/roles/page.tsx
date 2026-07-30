import type { Metadata } from 'next';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import PageContainer from '../../../../src/components/layout/PageContainer';
import { Tagline, Title } from '../../../../src/components/layout/Titles';
import { getCachedPublicOpenRoles } from '../../../../src/services/productions/cached';
import RolesBrowser from './roles-browser';

export const metadata: Metadata = {
  description:
    'Browse every open audition and crew opportunity posted by Chicago theatre companies. Filter by role type, pay, union status, and more.',
  title: 'Open Theatre Roles in Chicago | Chicago Artist Guide'
};

// Render per request rather than prerendering at build time: CI builds with
// placeholder Firebase config, so a build-time Firestore fetch fails the
// build outright. `getCachedPublicOpenRoles` (src/services/productions/cached.ts)
// wraps the read in `unstable_cache` with its own 5 minute revalidate, so
// per-request rendering doesn't mean a Firestore query per visitor.
export const dynamic = 'force-dynamic';

// Server Component: the full role list is fetched and rendered here so
// crawlers and first paint see every open role with no client-side fetch.
// Filtering stays client-side (see RolesBrowser) rather than URL-search-param
// driven — reading searchParams in a Server Component would require an even
// more dynamic render with no benefit here, since the route is already
// per-request.
const RolesPage = async () => {
  const roles = await getCachedPublicOpenRoles();

  return (
    <PageContainer>
      <Row>
        <Col lg={12}>
          <Title>OPEN THEATRE ROLES</Title>
          <Tagline>
            Browse every open audition and crew opportunity in Chicago theatre
          </Tagline>

          <RolesBrowser roles={roles} />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default RolesPage;
