import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TalentMatchesFilterBar } from '../components/Matches/TalentMatchesFilterBar';
import { updateRoleStatus } from '../components/Profile/Company/api';
import { sendRoleCloseDeclineNotifications } from '../components/Matches/declineNotifications';

vi.mock('../context/MatchContext', () => ({
  useMatches: vi.fn()
}));
vi.mock('../context/FirebaseContext', () => ({
  useFirebaseContext: vi.fn()
}));
vi.mock('../context/UserContext', () => ({
  useUserContext: vi.fn()
}));
vi.mock('../components/Profile/Company/api', () => ({
  updateRoleStatus: vi.fn()
}));
vi.mock('../components/Matches/declineNotifications', () => ({
  sendRoleCloseDeclineNotifications: vi.fn()
}));

import { useMatches } from '../context/MatchContext';
import { useFirebaseContext } from '../context/FirebaseContext';
import { useUserContext } from '../context/UserContext';

const mockUseMatches = vi.mocked(useMatches);
const mockUseFirebaseContext = vi.mocked(useFirebaseContext);
const mockUseUserContext = vi.mocked(useUserContext);
const mockUpdateRoleStatus = vi.mocked(updateRoleStatus);
const mockSendRoleCloseDeclineNotifications = vi.mocked(
  sendRoleCloseDeclineNotifications
);

const production = {
  production_id: 'p1',
  production_name: 'Demo Show',
  roles: [
    {
      role_id: 'r1',
      role_name: 'Lead',
      role_status: 'Open'
    }
  ]
};

const baseContext = {
  currentRoleId: 'r1',
  filters: { type: 'individual' as const },
  updateFilters: vi.fn(),
  roles: production.roles,
  setCurrentRoleId: vi.fn(),
  production,
  setProduction: vi.fn(),
  setRoles: vi.fn(),
  matches: [],
  loading: false
};

describe('TalentMatchesFilterBar close role', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMatches.mockReturnValue(baseContext as any);
    mockUseFirebaseContext.mockReturnValue({ firebaseFirestore: {} } as any);
    mockUseUserContext.mockReturnValue({
      account: { ref: { id: 'theater-1' }, data: { account_id: 'theater-1' } },
      profile: { data: { theatre_name: 'Demo Theatre' } }
    } as any);
    mockUpdateRoleStatus.mockResolvedValue([
      { role_id: 'r1', role_name: 'Lead', role_status: 'Closed' }
    ] as any);
    mockSendRoleCloseDeclineNotifications.mockResolvedValue(1);
  });

  it('shows a confirmation modal when changing role status from Open to Closed', async () => {
    render(<TalentMatchesFilterBar />);

    await userEvent.selectOptions(
      screen.getByLabelText('Role Status'),
      'Closed'
    );

    expect(
      screen.getByText(
        /By closing this role, you will automatically send a decline message to any artist who Applied and who you Declined\./
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(mockUpdateRoleStatus).not.toHaveBeenCalled();
  });

  it('closes the role and sends decline notifications when confirmed', async () => {
    render(<TalentMatchesFilterBar />);

    await userEvent.selectOptions(
      screen.getByLabelText('Role Status'),
      'Closed'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(mockUpdateRoleStatus).toHaveBeenCalledWith(
        {},
        'p1',
        'r1',
        'Closed',
        production.roles
      );
    });
    expect(mockSendRoleCloseDeclineNotifications).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ production_id: 'p1' }),
      'r1',
      'theater-1',
      'Demo Theatre'
    );
    expect(baseContext.setRoles).toHaveBeenCalled();
    expect(baseContext.setProduction).toHaveBeenCalled();
  });

  it('does not close the role when the confirmation is canceled', async () => {
    render(<TalentMatchesFilterBar />);

    await userEvent.selectOptions(
      screen.getByLabelText('Role Status'),
      'Closed'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockUpdateRoleStatus).not.toHaveBeenCalled();
    expect(mockSendRoleCloseDeclineNotifications).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Role Status')).toHaveValue('Open');
  });
});
