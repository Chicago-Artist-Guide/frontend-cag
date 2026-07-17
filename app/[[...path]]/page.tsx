import React from 'react';
import LegacyApp from '../legacy-app';

interface LegacyPageProps {
  params: Promise<{ path?: string[] }>;
}

const LegacyPage = async ({ params }: LegacyPageProps) => {
  const { path = [] } = await params;
  const requestedPathname = `/${path.map(encodeURIComponent).join('/')}`;

  return <LegacyApp key={requestedPathname} />;
};

export default LegacyPage;
