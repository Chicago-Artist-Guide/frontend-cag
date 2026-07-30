import Link from 'next/link';
import React from 'react';
import PageContainer from '../../../../../src/components/layout/PageContainer';
// Imported from its own file, not the `src/components/shared` barrel: that
// barrel re-exports several components (ResponsiveImageUpload, ErrorBoundary,
// etc.) that use hooks/class state without their own 'use client' directive.
// They're fine reached only through an already-'use client' ancestor, but
// this file is a genuine Server Component (Next's default 404 boundary for
// this route) — importing the barrel here drags the whole module graph into
// the RSC build and fails it.
import Button from '../../../../../src/components/shared/Button';

// Rendered when getProductionById(id) returns null (see page.tsx's
// notFound() call) — matches the legacy client route's "Show Not Found"
// copy (src/routes/PublicShowDetail.tsx), but as a real 404 response
// instead of a 200 with an empty-state message, so dead/removed productions
// don't stay indexed.
const ProductionNotFound = () => (
  <PageContainer>
    <Link
      className="mb-5 inline-block font-montserrat text-grayishBlue no-underline hover:text-mint hover:underline"
      href="/shows"
    >
      ← Back to shows
    </Link>

    <div className="mt-10 text-center">
      <h2 className="font-montserrat text-2xl font-semibold">
        Show Not Found
      </h2>
      <p className="mt-4 font-montserrat text-base text-grayishBlue">
        We couldn&apos;t find the show you&apos;re looking for. It may have
        been removed or is no longer active.
      </p>
      <Link className="mt-5 inline-block" href="/shows">
        <Button text="Browse All Shows" type="button" variant="primary" />
      </Link>
    </div>
  </PageContainer>
);

export default ProductionNotFound;
