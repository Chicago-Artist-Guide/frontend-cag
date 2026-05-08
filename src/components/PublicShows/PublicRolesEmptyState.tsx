import React from 'react';
import PublicRolesSignUpCTA from './PublicRolesSignUpCTA';

// DEV-495: shown when there are zero open roles in the entire system.
const PublicRolesEmptyState: React.FC = () => {
  return (
    <div
      className="mt-4 rounded-lg bg-white p-8 text-center shadow"
      data-testid="public-roles-empty-state"
    >
      <h2 className="font-montserrat text-2xl font-semibold text-darkGrey">
        No open roles right now
      </h2>
      <p className="mx-auto mt-3 max-w-md font-montserrat text-base text-darkGrey">
        Chicago theatres haven't posted any open roles yet. New opportunities
        are added regularly — check back soon, or sign up to be notified the
        moment a role goes live.
      </p>
      <div className="mx-auto mt-6 max-w-2xl">
        <PublicRolesSignUpCTA
          body="Get an email the moment new roles are posted."
          heading="Be the first to know"
        />
      </div>
    </div>
  );
};

export default PublicRolesEmptyState;
