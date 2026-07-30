'use client';

import React from 'react';
import Link from 'next/link';
import PublicRolesSignUpCTA from './PublicRolesSignUpCTA';

// DEV-495: shown when there are zero open roles in the entire system (not
// because of active filters — that is DEV-494's PublicRolesNoResults).
const PublicRolesEmptyState: React.FC = () => {
  return (
    <div
      className="mt-4 rounded-lg bg-white p-8 text-center shadow"
      data-testid="public-roles-empty-state"
    >
      {/* Decorative spotlight icon — inline SVG, no external asset needed */}
      <div
        aria-hidden="true"
        className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-mint/15"
      >
        <svg
          className="h-10 w-10 text-mint"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Calendar with a star — evokes "watch for upcoming events" */}
          <rect height="18" rx="2" ry="2" width="18" x="3" y="4" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
          <path d="M12 14l.5 1.5h1.5l-1.2.9.5 1.6-1.3-1-1.3 1 .5-1.6-1.2-.9h1.5z" />
        </svg>
      </div>

      <h2 className="font-montserrat text-2xl font-semibold text-darkGrey">
        No open roles right now
      </h2>

      <p className="mx-auto mt-3 max-w-md font-montserrat text-base text-grayishBlue">
        Chicago theatres post new auditions and crew opportunities regularly.
        Check back soon — or sign up so you&apos;re the first to know when
        something goes live.
      </p>

      {/* Primary CTA: sign-up notification banner */}
      <div className="mx-auto mt-8 max-w-2xl">
        <PublicRolesSignUpCTA
          body="Get an email the moment new roles are posted — it's free."
          heading="Be the first to know"
        />
      </div>

      {/* Secondary forward action */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          aria-label="Return to the Chicago Artist Guide home page"
          className="inline-flex items-center justify-center rounded-full border border-lightGrey px-5 py-2 font-montserrat text-sm font-bold uppercase tracking-wider text-grayishBlue hover:border-darkGrey hover:text-darkGrey"
          href="/"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PublicRolesEmptyState;
