import type { Metadata } from 'next';
import React from 'react';
import PageContainer from '../../../../src/components/layout/PageContainer';
import { Tagline, Title } from '../../../../src/components/layout/Titles';
import { getCachedRoleOpportunities } from '../../../../src/services/events/cached';
import { splitRoleOpportunities } from '../../../../src/services/events/roleOpportunities';
import type { RoleOpportunity } from '../../../../src/services/events/types';
import ContactForm from './contact-form';
import GetInvolvedPageFrame from './get-involved-page-frame';

export const metadata: Metadata = {
  description:
    'Browse open on- and off-stage role opportunities with Chicago theatre companies, and tell Chicago Artist Guide how you would like to get involved.',
  title: 'Get Involved | Chicago Artist Guide'
};

// Render per request rather than prerendering at build time: CI builds with
// placeholder Firebase config, so a build-time Firestore fetch either fails
// the build or silently ships a prerendered page containing zero
// opportunities. `getCachedRoleOpportunities`
// (src/services/events/cached.ts) caches the Firestore read itself, so
// per-request rendering does not mean a query per visitor.
export const dynamic = 'force-dynamic';

const RoleCard = ({
  index,
  role
}: {
  index: number;
  role: RoleOpportunity;
}) => (
  <div className="role-card" style={{ animationDelay: `${index * 0.1}s` }}>
    <div className="role-metadata">
      <h3 className="role-title">{role.roleName}</h3>
      {role.roleType && (
        <div className="metadata-item">
          <span className="metadata-label">Type:</span>
          <span className="metadata-value">{role.roleType}</span>
        </div>
      )}
      {role.pay && (
        <div className="metadata-item">
          <span className="metadata-label">Pay:</span>
          <span className="metadata-value">{role.pay}</span>
        </div>
      )}
      <div className="production-name">{role.productionName}</div>
      {role.location && (
        <div className="role-location">Location: {role.location}</div>
      )}
    </div>
    <div className="role-content">
      <h4 className="role-description-label">Role Description</h4>
      <p className="role-description">{role.description}</p>
      <a
        className="more-info-button"
        href={role.googleFormUrl || role.moreInfoUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        More Info
      </a>
    </div>
  </div>
);

const BoardCard = ({
  index,
  role
}: {
  index: number;
  role: RoleOpportunity;
}) => (
  <div className="board-card" style={{ animationDelay: `${index * 0.15}s` }}>
    <div className="board-metadata">
      <h3 className="board-title">{role.roleName}</h3>
      {role.location && (
        <div className="board-commitment">Location: {role.location}</div>
      )}
    </div>
    <div className="board-content">
      <h4 className="board-description-label">Role Description</h4>
      <p className="board-description">{role.description}</p>
      <a
        className="more-info-button"
        href={role.googleFormUrl || role.moreInfoUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        More Info
      </a>
    </div>
  </div>
);

// Server Component: role opportunities are fetched, split into ongoing vs.
// temporal, and rendered here so crawlers and first paint see the full list
// with no client-side fetch. Only the contact form at the bottom of the
// page is a Client Component (Formik + a Firestore write both need the
// browser) — see contact-form.tsx.
//
// Note: the legacy client route (src/routes/GetInvolved.tsx) also supports a
// `?demo=true` query param that swaps in a set of placeholder roles for
// screenshots/demos. That isn't carried over here — it exists for demos, not
// as real page content, and shipping a query param that fabricates listings
// on a public, now-crawlable page is worth avoiding on its own merits.
const GetInvolvedPage = async () => {
  const roles = await getCachedRoleOpportunities();
  const { ongoing, temporal } = splitRoleOpportunities(roles);

  return (
    <PageContainer>
      <GetInvolvedPageFrame>
        <div className="header-section">
          <Title>Get involved</Title>
          <Tagline>
            Join us in building a more connected and inclusive Chicago theatre
            community.
          </Tagline>
        </div>

        <div className="section">
          <h2 className="section-title">Current openings</h2>
          <p className="section-description">
            We are actively looking for these open roles.
          </p>

          {temporal.length === 0 ? (
            <p className="empty-state-text">
              No open role opportunities at this time. Check back soon!
            </p>
          ) : (
            <div className="role-list">
              {temporal.map((role, index) => (
                <RoleCard index={index} key={role.id} role={role} />
              ))}
            </div>
          )}
        </div>

        {ongoing.length > 0 && (
          <div className="section">
            <h2 className="section-title">Ongoing open positions</h2>
            <p className="section-description">
              We are always looking to fill these roles.
            </p>

            <div className="board-list">
              {ongoing.map((role, index) => (
                <BoardCard index={index} key={role.id} role={role} />
              ))}
            </div>
          </div>
        )}

        <div className="section">
          <h2 className="section-title">
            Your unique skills could help us grow!
          </h2>
          <p className="section-description">
            Tell us how you'd like to contribute.
          </p>

          <ContactForm />
        </div>

        <div className="end-of-page">— thank you for your interest —</div>
      </GetInvolvedPageFrame>
    </PageContainer>
  );
};

export default GetInvolvedPage;
