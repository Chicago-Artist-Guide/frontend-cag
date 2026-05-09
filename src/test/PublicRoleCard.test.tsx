import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PublicRoleCard from '../components/PublicShows/PublicRoleCard';
import type { Role } from '../components/Profile/Company/types';

const baseRole: Role = {
  role_id: 'r1',
  role_name: 'Lead Actor',
  type: 'On-Stage',
  role_status: 'Open'
};

const renderCard = (
  role: Role,
  extras?: Partial<{
    productionId: string;
    productionName: string;
    auditionStart: string;
    auditionEnd: string;
  }>
) => {
  return render(
    <MemoryRouter>
      <PublicRoleCard role={role} {...extras} />
    </MemoryRouter>
  );
};

describe('PublicRoleCard', () => {
  it('renders role name', () => {
    renderCard(baseRole);
    expect(screen.getByText('Lead Actor')).toBeInTheDocument();
  });

  it('falls back to offstage_role when role_name is absent', () => {
    renderCard({
      ...baseRole,
      role_name: undefined,
      offstage_role: 'Stage Manager'
    });
    expect(screen.getByText('Stage Manager')).toBeInTheDocument();
  });

  it('shows "Untitled Role" when neither role_name nor offstage_role is set', () => {
    renderCard({ ...baseRole, role_name: undefined, offstage_role: undefined });
    expect(screen.getByText('Untitled Role')).toBeInTheDocument();
  });

  it('does not render the "Open" role status badge', () => {
    // The API only returns Open roles; the badge would be redundant noise.
    renderCard(baseRole);
    expect(screen.queryByText('Open')).not.toBeInTheDocument();
  });

  describe('rate display', () => {
    it('formats pay rate with dollar sign and unit — no "per Per" duplication', () => {
      renderCard({ ...baseRole, role_rate: 500, role_rate_unit: 'Per Week' });
      expect(screen.getByText('$500 Per Week')).toBeInTheDocument();
      expect(screen.queryByText(/per Per/)).not.toBeInTheDocument();
    });

    it('shows rate without unit when unit is absent', () => {
      renderCard({ ...baseRole, role_rate: 200 });
      expect(screen.getByText('$200')).toBeInTheDocument();
    });

    it('shows rate when role_rate is 0 (free/volunteer)', () => {
      renderCard({ ...baseRole, role_rate: 0 });
      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('hides rate section when role_rate is not set', () => {
      renderCard({ ...baseRole, role_rate: undefined });
      expect(screen.queryByText('Rate:')).not.toBeInTheDocument();
    });
  });

  describe('description truncation', () => {
    it('renders a description when provided', () => {
      renderCard({ ...baseRole, description: 'A short description' });
      expect(screen.getByText('A short description')).toBeInTheDocument();
    });

    it('does not render description element when absent', () => {
      renderCard({ ...baseRole, description: undefined });
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });
  });

  describe('list mode', () => {
    it('shows production name as a link when productionId and productionName are present', () => {
      renderCard(baseRole, {
        productionId: 'p1',
        productionName: 'Hamlet'
      });
      expect(screen.getByText('Hamlet')).toBeInTheDocument();
      const productionLink = screen.getByRole('link', { name: 'Hamlet' });
      expect(productionLink).toHaveAttribute('href', '/shows/p1');
    });

    it('shows a "View Production" button linking to the production page', () => {
      renderCard(baseRole, {
        productionId: 'p1',
        productionName: 'Hamlet'
      });
      const viewBtn = screen.getByRole('button', { name: /view production/i });
      expect(viewBtn).toBeInTheDocument();
      const link = viewBtn.closest('a');
      expect(link).toHaveAttribute('href', '/shows/p1');
    });

    it('does not show "View Production" button when not in list mode', () => {
      renderCard(baseRole);
      expect(
        screen.queryByRole('button', { name: /view production/i })
      ).not.toBeInTheDocument();
    });

    it('hides production name line when productionName is absent', () => {
      renderCard(baseRole, { productionId: 'p1' });
      // Production link should not exist without a name to display.
      expect(
        screen.queryByRole('link', { name: /shows\/p1/ })
      ).not.toBeInTheDocument();
    });
  });

  describe('audition date window', () => {
    it('renders the audition window when both dates are provided', () => {
      renderCard(baseRole, {
        productionId: 'p1',
        auditionStart: '2026-06-01',
        auditionEnd: '2026-06-15'
      });
      expect(screen.getByText('Auditions:')).toBeInTheDocument();
      const container = screen.getByText('Auditions:').closest('div');
      expect(container?.textContent).toContain('–');
    });

    it('does not render audition section when no dates are provided', () => {
      renderCard(baseRole);
      expect(screen.queryByText('Auditions:')).not.toBeInTheDocument();
    });
  });

  describe('detail chips', () => {
    it('renders stage type', () => {
      renderCard(baseRole);
      expect(screen.getByText('Stage:')).toBeInTheDocument();
      expect(screen.getByText('On-Stage')).toBeInTheDocument();
    });

    it('renders union information', () => {
      renderCard({ ...baseRole, union: ['AEA', 'Non-Union'] });
      expect(screen.getByText('Union:')).toBeInTheDocument();
      expect(screen.getByText('AEA, Non-Union')).toBeInTheDocument();
    });

    it('hides union section when union array is empty', () => {
      renderCard({ ...baseRole, union: [] });
      expect(screen.queryByText('Union:')).not.toBeInTheDocument();
    });
  });
});
