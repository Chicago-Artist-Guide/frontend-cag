import type { Metadata } from 'next';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import PageContainer from '../../../../src/components/layout/PageContainer';
import { Tagline, Title } from '../../../../src/components/layout/Titles';
import PublicShowCard from '../../../../src/components/PublicShows/PublicShowCard';
import { getCachedActiveProductions } from '../../../../src/services/productions/cached';
import {
  SHOWS_PER_PAGE,
  paginateProductions,
  parsePageParam
} from './_lib/paginate-productions';
import ShowsPagination from './_lib/shows-pagination';

export const metadata: Metadata = {
  description:
    'Browse every currently active production posted by Chicago theatre companies — discover casting opportunities and upcoming shows in Chicago theatre.',
  title: 'Theatre Shows in Chicago | Chicago Artist Guide'
};

// NOTE: no `export const revalidate` here — this page reads `searchParams`
// for `?page=`, which forces per-request dynamic rendering and makes a
// page-level `revalidate` a no-op (see app/(main)/(public)/roles/page.tsx for
// the same tradeoff on that page). The 5-minute read-cost reduction instead
// lives on the Firestore call itself; see src/services/productions/cached.ts.
interface ShowsPageProps {
  searchParams: Promise<{ page?: string }>;
}

// Server Component: the active production list is fetched and paginated
// here so crawlers and first paint see real show content with no
// client-side fetch. `listActiveProductions()` returns every active
// production already sorted by name (src/services/productions/server.ts) —
// there's no Firestore cursor to page through, so a page is just an
// in-memory slice keyed off `?page=`.
const ShowsPage = async ({ searchParams }: ShowsPageProps) => {
  const { page } = await searchParams;
  const productions = await getCachedActiveProductions();
  const { currentPage, pageItems, totalPages } = paginateProductions(
    productions,
    parsePageParam(page)
  );

  return (
    <PageContainer>
      <Row>
        <Col lg={12}>
          <Title>THEATRE SHOWS</Title>
          <Tagline>Discover opportunities in Chicago theatre</Tagline>

          {productions.length === 0 ? (
            <p>No active shows found at this time. Please check back later.</p>
          ) : (
            <>
              <div className="mt-4">
                {pageItems.map((show, index) => (
                  <PublicShowCard
                    key={`${show.production_id || 'unknown'}-${index}`}
                    show={show}
                  />
                ))}
              </div>

              <ShowsPagination
                currentPage={currentPage}
                itemsPerPage={SHOWS_PER_PAGE}
                totalItems={productions.length}
                totalPages={totalPages}
              />
            </>
          )}
        </Col>
      </Row>
    </PageContainer>
  );
};

export default ShowsPage;
