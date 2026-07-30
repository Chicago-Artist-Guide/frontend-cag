import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import PageContainer from '../../../../../src/components/layout/PageContainer';
import { Title } from '../../../../../src/components/layout/Titles';
import PublicRoleCard from '../../../../../src/components/PublicShows/PublicRoleCard';
import { getCachedProductionById } from '../../../../../src/services/productions/cached';
import ProductionDetailTabs from './_lib/production-detail-tabs';
import { buildProductionMetadata } from './_lib/production-metadata';
import SignUpPrompt from './_lib/sign-up-prompt';

// generateMetadata and the page body each resolve the same production, so both
// go through the cached read — `unstable_cache` collapses them into one
// Firestore fetch rather than two per request.
//
// Revalidate every 5 minutes. This page only reads the `productionId` path
// segment (no `searchParams`), so — unlike /shows's list page — it stays
// eligible for ISR: each show detail is cached and served statically for up
// to 5 minutes between Firestore reads, matching /roles's page-level window
// (app/(main)/(public)/roles/page.tsx) and cutting read cost the same way.
export const revalidate = 300;

interface ProductionPageProps {
  params: Promise<{ productionId: string }>;
}

export const generateMetadata = async ({
  params
}: ProductionPageProps): Promise<Metadata> => {
  const { productionId } = await params;
  const production = await getCachedProductionById(productionId);

  if (!production) {
    return { title: 'Show Not Found | Chicago Artist Guide' };
  }

  return buildProductionMetadata(production);
};

const formatDate = (value?: string): string =>
  value ? new Date(value).toLocaleDateString() : '';

// Server Component: the production (and its roles, which live embedded on
// the production document — see src/services/productions/server.ts) is
// fetched here so crawlers and first paint see full show content with no
// client-side fetch. Only the tab shell and the anonymous-visitor sign-up
// line are client islands; see their own files for why.
const ProductionPage = async ({ params }: ProductionPageProps) => {
  const { productionId } = await params;
  const production = await getCachedProductionById(productionId);

  if (!production) {
    notFound();
  }

  const roles = Array.isArray(production.roles) ? production.roles : [];
  const onStageRoles = roles.filter((role) => role && role.type === 'On-Stage');
  const offStageRoles = roles.filter(
    (role) => role && role.type === 'Off-Stage'
  );
  const hasProductionDates = Boolean(
    production.open_and_close_start || production.open_and_close_end
  );
  const hasAuditionDates = Boolean(
    production.audition_start || production.audition_end
  );
  const hasAuditionInfo =
    hasAuditionDates ||
    Boolean(
      production.audition_location ||
      production.contact_person_name_audition ||
      production.contact_person_email_audition ||
      production.materials_to_prepare_audition ||
      production.additional_notes_audition
    );

  const basicInfo = (
    <Row>
      <Col lg={4}>
        <Image
          className="mb-[15px] w-full rounded-lg"
          fluid
          src={production.production_image_url || ''}
        />
        <div className="mb-5 font-montserrat text-base font-semibold text-mint">
          {production.status || 'Status Not Available'}
        </div>

        {production.writers && (
          <div className="mb-[15px]">
            <div className="font-montserrat text-sm font-semibold text-grayishBlue">
              Written by:
            </div>
            <div className="font-montserrat text-base">
              {production.writers}
            </div>
          </div>
        )}

        {production.director && (
          <div className="mb-[15px]">
            <div className="font-montserrat text-sm font-semibold text-grayishBlue">
              Director:
            </div>
            <div className="font-montserrat text-base">
              {production.director}
            </div>
          </div>
        )}

        {production.location && (
          <div className="mb-[15px]">
            <div className="font-montserrat text-sm font-semibold text-grayishBlue">
              Location:
            </div>
            <div className="font-montserrat text-base">
              {production.location}
            </div>
          </div>
        )}

        {hasProductionDates && (
          <div className="mb-[15px]">
            <div className="font-montserrat text-sm font-semibold text-grayishBlue">
              Production Dates:
            </div>
            <div className="font-montserrat text-base">
              {formatDate(production.open_and_close_start)}
              {production.open_and_close_start &&
                production.open_and_close_end &&
                ' - '}
              {formatDate(production.open_and_close_end)}
            </div>
          </div>
        )}

        <SignUpPrompt />
      </Col>

      <Col lg={8}>
        <div className="mb-[30px] whitespace-pre-line font-montserrat text-base leading-relaxed">
          {production.description || 'No description available.'}
        </div>

        {onStageRoles.length > 0 && (
          <div className="mb-[30px]">
            <h3 className="mb-[15px] border-b border-lightGrey pb-[10px] font-montserrat text-xl font-semibold">
              On-Stage Roles
            </h3>
            {onStageRoles.map((role, index) => (
              <PublicRoleCard
                key={`${role.role_id || 'unknown'}-onstage-${index}`}
                role={role}
              />
            ))}
          </div>
        )}

        {offStageRoles.length > 0 && (
          <div className="mb-[30px]">
            <h3 className="mb-[15px] border-b border-lightGrey pb-[10px] font-montserrat text-xl font-semibold">
              Off-Stage Roles
            </h3>
            {offStageRoles.map((role, index) => (
              <PublicRoleCard
                key={`${role.role_id || 'unknown'}-offstage-${index}`}
                role={role}
              />
            ))}
          </div>
        )}

        {onStageRoles.length === 0 && offStageRoles.length === 0 && (
          <p className="font-montserrat text-base italic text-grayishBlue">
            No roles have been posted for this production yet.
          </p>
        )}
      </Col>
    </Row>
  );

  const auditionInfo = (
    <Row>
      <Col lg={12}>
        {hasAuditionDates && (
          <div className="mb-[15px]">
            <div className="font-montserrat text-sm font-semibold text-grayishBlue">
              Audition Dates:
            </div>
            <div className="font-montserrat text-base">
              {formatDate(production.audition_start)}
              {production.audition_start && production.audition_end && ' - '}
              {formatDate(production.audition_end)}
            </div>
          </div>
        )}

        {production.audition_location && (
          <div className="mb-[15px]">
            <div className="font-montserrat text-sm font-semibold text-grayishBlue">
              Audition Location:
            </div>
            <div className="font-montserrat text-base">
              {production.audition_location}
            </div>
          </div>
        )}

        {production.contact_person_name_audition && (
          <div className="mb-[15px]">
            <div className="font-montserrat text-sm font-semibold text-grayishBlue">
              Contact Person:
            </div>
            <div className="font-montserrat text-base">
              {production.contact_person_name_audition}
            </div>
          </div>
        )}

        {production.contact_person_email_audition && (
          <div className="mb-[15px]">
            <div className="font-montserrat text-sm font-semibold text-grayishBlue">
              Contact Email:
            </div>
            <div className="font-montserrat text-base">
              {production.contact_person_email_audition}
            </div>
          </div>
        )}

        {production.materials_to_prepare_audition && (
          <div className="mb-[15px]">
            <div className="font-montserrat text-sm font-semibold text-grayishBlue">
              Materials to Prepare:
            </div>
            <div className="whitespace-pre-line font-montserrat text-base">
              {production.materials_to_prepare_audition}
            </div>
          </div>
        )}

        {production.additional_notes_audition && (
          <div className="mb-[15px]">
            <div className="font-montserrat text-sm font-semibold text-grayishBlue">
              Additional Notes:
            </div>
            <div className="whitespace-pre-line font-montserrat text-base">
              {production.additional_notes_audition}
            </div>
          </div>
        )}

        {!hasAuditionInfo && (
          <p className="font-montserrat text-base italic text-grayishBlue">
            No audition information has been posted for this production yet.
          </p>
        )}
      </Col>
    </Row>
  );

  return (
    <PageContainer>
      <Row>
        <Col lg={12}>
          <Link
            className="mb-5 inline-block font-montserrat text-grayishBlue no-underline hover:text-mint hover:underline"
            href="/shows"
          >
            ← Back to shows
          </Link>
          <Title>{production.production_name}</Title>
          {/* Theater name: read straight off the denormalized field on the
              production doc. The legacy client route falls back to a
              `getAccountByIdOrUid`/`findProfileByAccountId` lookup for
              productions missing it, but both of those hit `accounts`/
              `profiles`, which require auth and are denied for this
              unauthenticated server read (see src/lib/firebase/server.ts).
              Un-backfilled legacy productions simply show no theater name
              here rather than adding a second, auth-gated data path. */}
          {production.theater_name ? (
            <Link
              className="mb-5 block font-montserrat text-xl font-medium text-grayishBlue no-underline hover:text-mint hover:underline"
              href={`/profile/view/${production.account_id}`}
            >
              {production.theater_name}
            </Link>
          ) : null}
        </Col>
      </Row>

      <Row className="mt-4">
        <Col lg={12}>
          <Suspense fallback={basicInfo}>
            <ProductionDetailTabs
              auditionInfo={auditionInfo}
              basicInfo={basicInfo}
            />
          </Suspense>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default ProductionPage;
