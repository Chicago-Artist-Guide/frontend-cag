import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserContextType } from '../../../context/UserContext';
import { useUserContext } from '../../../context/UserContext';
import { updateProfile } from '../../../services/profiles/client';
import CompanyProfileEdit from './Edit';

vi.mock('../../../context/UserContext', () => ({ useUserContext: vi.fn() }));
vi.mock('../../../services/profiles/client', () => ({
  updateProfile: vi.fn()
}));
vi.mock('../../../components/shared', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../../components/shared')>();

  return {
    ...actual,
    ImageUploadComponent: () => <div>Company image upload</div>
  };
});

const mockUseUserContext = vi.mocked(useUserContext);
const mockUpdateProfile = vi.mocked(updateProfile);
const profileData = {
  account_id: 'account-1',
  uid: 'company-uid',
  theatre_name: 'CAG Theatre',
  number_of_members: '4',
  additional_photos: {},
  awards: [
    { award_id: 'keep', award_name: 'Best Ensemble' },
    { award_id: 'drop', award_name: '' }
  ]
};

const buildContext = (
  profileId: string | null = 'profile-1'
): UserContextType => ({
  account: { id: 'account-1', data: { uid: 'user-1', type: 'company' } },
  setAccount: vi.fn(),
  setAccountData: vi.fn(),
  profile: { id: profileId, data: profileData },
  setProfile: vi.fn(),
  setProfileData: vi.fn(),
  currentUser: null,
  setCurrentUser: vi.fn()
});

describe('CompanyProfileEdit service boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateProfile.mockResolvedValue();
  });

  it('saves exact merged data by profile ID and syncs context with that data', async () => {
    const context = buildContext();
    mockUseUserContext.mockReturnValue(context);
    render(<CompanyProfileEdit toggleEdit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('number_of_members'), {
      target: { name: 'number_of_members', value: '12' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Profile' }));

    await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalledTimes(1));
    const expected = {
      ...profileData,
      number_of_members: '12',
      awards: [{ award_id: 'keep', award_name: 'Best Ensemble' }]
    };
    expect(mockUpdateProfile).toHaveBeenCalledWith('profile-1', expected);
    expect(context.setProfileData).toHaveBeenCalledWith(expected);
    expect(context.setProfileData).toHaveBeenCalledWith(
      mockUpdateProfile.mock.calls[0][1]
    );
  });

  it('does not write without a profile ID', async () => {
    const toggleEdit = vi.fn();
    const context = buildContext(null);
    mockUseUserContext.mockReturnValue(context);
    render(<CompanyProfileEdit toggleEdit={toggleEdit} />);
    fireEvent.change(screen.getByLabelText('number_of_members'), {
      target: { name: 'number_of_members', value: '12' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Profile' }));

    await waitFor(() => expect(toggleEdit).toHaveBeenCalledTimes(1));
    expect(mockUpdateProfile).not.toHaveBeenCalled();
    expect(context.setProfileData).not.toHaveBeenCalled();
  });
});
