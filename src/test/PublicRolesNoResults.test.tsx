import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PublicRolesNoResults from '../components/PublicShows/PublicRolesNoResults';

const renderComponent = (onClearFilters = vi.fn()) =>
  render(
    <MemoryRouter>
      <PublicRolesNoResults onClearFilters={onClearFilters} />
    </MemoryRouter>
  );

describe('PublicRolesNoResults', () => {
  it('renders the filtered null state with the correct heading', () => {
    renderComponent();

    expect(screen.getByTestId('public-roles-no-results')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /no roles match your filters/i })
    ).toBeInTheDocument();
  });

  it('renders explanatory sub-copy that distinguishes it from the no-roles state', () => {
    renderComponent();

    // Should mention that roles exist but filters are hiding them.
    expect(
      screen.getByText(/there are open roles in the system/i)
    ).toBeInTheDocument();
  });

  it('calls onClearFilters when the Clear Filters button is clicked', () => {
    const onClearFilters = vi.fn();
    renderComponent(onClearFilters);

    const button = screen.getByRole('button', { name: /clear.*filters/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });

  it('renders a secondary Sign Up link pointing to /sign-up', () => {
    renderComponent();

    const signUpLink = screen.getByTestId('no-results-signup-link');
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute('href', '/sign-up');
  });

  it('does not render the "no roles at all" copy', () => {
    renderComponent();

    expect(
      screen.queryByText(/no open roles right now/i)
    ).not.toBeInTheDocument();
  });
});
