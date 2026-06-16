import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PublicRolesSignUpCTA from '../components/PublicShows/PublicRolesSignUpCTA';

const renderCTA = (
  props: React.ComponentProps<typeof PublicRolesSignUpCTA> = {}
) =>
  render(
    <MemoryRouter>
      <PublicRolesSignUpCTA {...props} />
    </MemoryRouter>
  );

describe('PublicRolesSignUpCTA', () => {
  it('renders without crashing', () => {
    renderCTA();
    expect(screen.getByTestId('public-roles-signup-cta')).toBeInTheDocument();
  });

  it('primary CTA href points to /sign-up', () => {
    renderCTA();
    const primaryLink = screen.getByRole('link', {
      name: /create a free artist account/i
    });
    expect(primaryLink).toHaveAttribute('href', '/sign-up');
  });

  it('secondary action href points to /get-involved', () => {
    renderCTA();
    const secondaryLink = screen.getByRole('link', {
      name: /learn how chicago artist guide works/i
    });
    expect(secondaryLink).toHaveAttribute('href', '/get-involved');
  });

  it('renders default heading and body copy', () => {
    renderCTA();
    expect(screen.getByText(/Don.t miss your next role/i)).toBeInTheDocument();
    expect(screen.getByText(/Build a free profile/i)).toBeInTheDocument();
  });

  it('accepts custom heading and body via props', () => {
    renderCTA({
      heading: 'Be the first to know',
      body: 'Get an email the moment new roles are posted.'
    });
    expect(screen.getByText('Be the first to know')).toBeInTheDocument();
    expect(
      screen.getByText('Get an email the moment new roles are posted.')
    ).toBeInTheDocument();
  });

  it('has distinct accessible section labels per variant (no duplicate landmarks)', () => {
    const { unmount } = renderCTA();
    expect(
      screen.getByRole('region', { name: /sign up after browsing roles/i })
    ).toBeInTheDocument();
    unmount();

    renderCTA({ variant: 'banner' });
    expect(
      screen.getByRole('region', { name: /sign up before browsing roles/i })
    ).toBeInTheDocument();
  });

  it('renders banner variant with correct test id', () => {
    renderCTA({ variant: 'banner' });
    expect(screen.getByTestId('public-roles-signup-cta')).toBeInTheDocument();
    // Banner variant still contains the primary /sign-up link.
    expect(
      screen.getByRole('link', { name: /create a free artist account/i })
    ).toHaveAttribute('href', '/sign-up');
  });

  it('renders inline variant with correct test id', () => {
    renderCTA({ variant: 'inline' });
    expect(screen.getByTestId('public-roles-signup-cta')).toBeInTheDocument();
  });
});
