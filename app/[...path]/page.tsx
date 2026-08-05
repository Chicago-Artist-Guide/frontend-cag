import { notFound } from 'next/navigation';
import React from 'react';
import LegacyApp from '../legacy-app';
import { LEGACY_FIRST_SEGMENTS } from './legacy-first-segments';

// Every URL not yet migrated to the App Router falls through to here and is
// handed to the legacy React Router SPA.
//
// This is a REQUIRED catch-all (`[...path]`), not an optional one. An optional
// catch-all also matches `/`, which collides with the real root page in
// `app/(main)/(public)/page.tsx` — Next rejects two routes of equal
// specificity. Requiring at least one segment leaves `/` to the server-rendered
// home page and keeps this bridge for deeper legacy paths only.
interface LegacyPageProps {
  params: Promise<{ path?: string[] }>;
}

const LEGACY_SEGMENTS: readonly string[] = LEGACY_FIRST_SEGMENTS;

const LegacyPage = async ({ params }: LegacyPageProps) => {
  const { path = [] } = await params;
  if (!path[0] || !LEGACY_SEGMENTS.includes(path[0])) {
    notFound();
  }
  const requestedPathname = `/${path.map(encodeURIComponent).join('/')}`;

  return <LegacyApp key={requestedPathname} />;
};

export default LegacyPage;
