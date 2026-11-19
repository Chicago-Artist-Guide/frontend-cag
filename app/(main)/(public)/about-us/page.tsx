import React from 'react';
import { getCachedAboutContent } from '../../../../src/services/aboutUs/cached';
import WhoWeAre from '../../../../src/routes/WhoWeAre';

// Per-request render (cached read) — see app/(main)/(public)/events/page.tsx
// for why public Firestore-backed pages do not prerender at build time.
export const dynamic = 'force-dynamic';

const AboutUsPage = async () => (
  <WhoWeAre content={await getCachedAboutContent()} />
);

export default AboutUsPage;
