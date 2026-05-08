import React from 'react';
import { Link } from 'react-router-dom';

interface PublicRolesSignUpCTAProps {
  // Optional override copy — null states reuse this component with
  // tweaked messaging (e.g. "Be the first to know" when zero roles
  // exist).
  heading?: string;
  body?: string;
  className?: string;
}

const PublicRolesSignUpCTA: React.FC<PublicRolesSignUpCTAProps> = ({
  heading = 'Want to know when new roles are posted?',
  body = 'Sign up for free to get notified about opportunities that match your profile.',
  className = ''
}) => {
  return (
    <section
      className={`mb-8 rounded-lg border border-mint/40 bg-mint/10 p-6 md:flex md:items-center md:justify-between ${className}`}
      data-testid="public-roles-signup-cta"
    >
      <div className="md:pr-6">
        <h3 className="font-montserrat text-lg font-semibold text-darkGrey">
          {heading}
        </h3>
        <p className="mt-1 font-montserrat text-sm text-darkGrey">{body}</p>
      </div>
      <div className="mt-4 flex flex-shrink-0 gap-3 md:mt-0">
        <Link
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 font-montserrat text-sm font-bold uppercase tracking-wider text-white shadow-sm hover:bg-darkPrimary"
          to="/sign-up"
        >
          Sign Up
        </Link>
        <Link
          className="inline-flex items-center justify-center rounded-full border border-cornflower px-5 py-2 font-montserrat text-sm font-bold uppercase tracking-wider text-cornflower hover:bg-cornflower hover:text-white"
          to="/login"
        >
          Log In
        </Link>
      </div>
    </section>
  );
};

export default PublicRolesSignUpCTA;
