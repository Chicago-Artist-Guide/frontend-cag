import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PublicRolesEmptyState from '../components/PublicShows/PublicRolesEmptyState';

const renderComponent = () =>
  render(
    <MemoryRouter>
      <PublicRolesEmptyState />
    </MemoryRouter>
  );

describe('PublicRolesEmptyState', () => {
  it('renders the component without crashing', () => {
    renderComponent();
    expect(screen.getByTestId('public-roles-empty-state')).toBeInTheDocument();
  });

  it('displays the "no open roles" heading at h2 level', () => {
    renderComponent();
    const heading = screen.getByRole('heading', {
      level: 2,
      name: /no open roles right now/i
    });
    expect(heading).toBeInTheDocument();
  });

  it('renders friendly sub-copy that is warm and informative', () => {
    renderComponent();
    // Verifies the copy mentions checking back and regular posting.
    expect(
      screen.getByText(/check back soon|posted regularly|regularly/i)
    ).toBeInTheDocument();
  });

  it('renders at least one /sign-up link inside the embedded CTA', () => {
    renderComponent();
    // Query by destination, not by visible text — the CTA copy is owned by
    // PublicRolesSignUpCTA (DEV-498) and should be free to evolve.
    const links = screen.getAllByRole('link');
    const signUpLinks = links.filter(
      (l) => l.getAttribute('href') === '/sign-up'
    );
    expect(signUpLinks.length).toBeGreaterThan(0);
  });

  it('renders a "Back to Home" navigation link', () => {
    renderComponent();
    // The link's accessible name comes from aria-label on the element.
    const homeLink = screen.getByRole('link', {
      name: /return to the chicago artist guide home page/i
    });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('does not render anything from the filter-driven no-results state', () => {
    renderComponent();
    // The filter-driven state (DEV-494) uses data-testid="public-roles-no-results".
    expect(
      screen.queryByTestId('public-roles-no-results')
    ).not.toBeInTheDocument();
    // The "Clear Filters" button belongs to DEV-494, not this component.
    expect(
      screen.queryByRole('button', { name: /clear filters/i })
    ).not.toBeInTheDocument();
  });

  it('renders the embedded sign-up CTA section', () => {
    renderComponent();
    expect(screen.getByTestId('public-roles-signup-cta')).toBeInTheDocument();
  });

  it('has an accessible heading hierarchy (h2 as primary heading)', () => {
    renderComponent();
    // h2 is appropriate here since the page title is an h1 rendered by the
    // parent route (PublicRoles).
    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    expect(h2Elements.length).toBeGreaterThanOrEqual(1);
    expect(h2Elements[0]).toHaveTextContent(/no open roles right now/i);
  });
});
