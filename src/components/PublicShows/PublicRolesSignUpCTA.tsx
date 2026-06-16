import React from 'react';
import { Link } from 'react-router-dom';

interface PublicRolesSignUpCTAProps {
  // Optional override copy -- null states reuse this component with
  // tweaked messaging (e.g. "Be the first to know" when zero roles exist).
  heading?: string;
  body?: string;
  className?: string;
  // Controls visual weight: 'banner' (solid cornflower block, used above
  // the role list) or 'inline' (lighter mint-tinted border, default, used
  // after the list and inside the empty-state container).
  variant?: 'banner' | 'inline';
}

const PublicRolesSignUpCTA: React.FC<PublicRolesSignUpCTAProps> = ({
  heading = "Don't miss your next role",
  body = 'Build a free profile and get notified the moment a role that matches your skills goes live.',
  className = '',
  variant = 'inline'
}) => {
  const isBanner = variant === 'banner';

  const wrapperClasses = isBanner
    ? `rounded-xl bg-cornflower px-8 py-7 text-white md:flex md:items-center md:justify-between ${className}`
    : `rounded-lg border border-mint/40 bg-mint/10 p-6 md:flex md:items-center md:justify-between ${className}`;

  const headingClasses = isBanner
    ? 'font-montserrat text-xl font-bold text-white'
    : 'font-montserrat text-lg font-semibold text-darkGrey';

  const bodyClasses = isBanner
    ? 'mt-1 font-montserrat text-sm text-white/90'
    : 'mt-1 font-montserrat text-sm text-darkGrey';

  // Distinct landmark labels per placement so screen-reader landmark
  // navigation can tell the two CTAs apart on the same page.
  const landmarkLabel = isBanner
    ? 'Sign up before browsing roles'
    : 'Sign up after browsing roles';

  return (
    <section
      aria-label={landmarkLabel}
      className={wrapperClasses}
      data-testid="public-roles-signup-cta"
    >
      <div className="md:pr-8">
        <h3 className={headingClasses}>{heading}</h3>
        <p className={bodyClasses}>{body}</p>
      </div>
      <div className="mt-5 flex flex-shrink-0 flex-wrap gap-3 md:mt-0">
        <Link
          aria-label="Create a free artist account"
          className={
            isBanner
              ? // White button on cornflower banner: 7.6:1 contrast (AAA).
                'inline-flex items-center justify-center rounded-full bg-white px-6 py-2 font-montserrat text-sm font-bold uppercase tracking-wider text-darkPrimary shadow-sm hover:bg-bodyBg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-cornflower'
              : // darkPrimary on white: 7.4:1 contrast (AAA).
                'inline-flex items-center justify-center rounded-full bg-darkPrimary px-5 py-2 font-montserrat text-sm font-bold uppercase tracking-wider text-white shadow-sm hover:bg-cornflower focus:outline-none focus:ring-2 focus:ring-darkPrimary focus:ring-offset-2'
          }
          to="/sign-up"
        >
          Join Free
        </Link>
        <Link
          aria-label="Learn how Chicago Artist Guide works"
          className={
            isBanner
              ? 'inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-2 font-montserrat text-sm font-bold uppercase tracking-wider text-white hover:border-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-cornflower'
              : 'inline-flex items-center justify-center rounded-full border border-cornflower px-5 py-2 font-montserrat text-sm font-bold uppercase tracking-wider text-cornflower hover:bg-cornflower hover:text-white focus:outline-none focus:ring-2 focus:ring-cornflower focus:ring-offset-2'
          }
          to="/get-involved"
        >
          How it Works
        </Link>
      </div>
    </section>
  );
};

export default PublicRolesSignUpCTA;
