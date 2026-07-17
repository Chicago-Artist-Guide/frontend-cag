import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserContextType } from '../context/UserContext';
import { useUserContext } from '../context/UserContext';
import { getAccountById } from '../services/accounts/client';
import { getProfileById } from '../services/profiles/client';
import Profile from './Profile';

const routeMocks = vi.hoisted(() => ({
  accountId: undefined as string | undefined,
  auth: {},
  companyProfile: vi.fn(() => null),
  individualProfile: vi.fn(() => null),
  navigate: vi.fn()
}));

vi.mock('firebase/auth', () => ({
  getAuth: () => routeMocks.auth,
  onAuthStateChanged: (_auth: unknown, onChange: (user: unknown) => void) => {
    onChange({ uid: 'auth-owner' });
    return vi.fn();
  }
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => routeMocks.navigate,
  useParams: () => ({ accountId: routeMocks.accountId })
}));

vi.mock('../components/Profile/Company', () => ({
  default: routeMocks.companyProfile
}));

vi.mock('../components/Profile/Individual', () => ({
  default: routeMocks.individualProfile
}));

vi.mock('../context/UserContext', () => ({
  useUserContext: vi.fn()
}));

vi.mock('../services/accounts/client', () => ({
  getAccountById: vi.fn(),
  getAccountByIdOrUid: vi.fn()
}));

vi.mock('../services/profiles/client', () => ({
  findProfileByUidOrAccountId: vi.fn(),
  getProfileById: vi.fn()
}));

const mockUseUserContext = vi.mocked(useUserContext);
const mockGetAccountById = vi.mocked(getAccountById);
const mockGetProfileById = vi.mocked(getProfileById);

const buildUserContext = (type: 'company' | 'individual'): UserContextType => ({
  account: {
    data: { type, uid: 'auth-owner' },
    id: 'account-1',
    ref: null
  },
  currentUser: null,
  profile: {
    data: { account_id: 'account-1', uid: 'auth-owner' },
    id: 'profile-1',
    ref: null
  },
  setAccountData: vi.fn(),
  setAccountRef: vi.fn(),
  setCurrentUser: vi.fn(),
  setProfileData: vi.fn(),
  setProfileRef: vi.fn()
});

const renderOwnerProfile = async (type: 'company' | 'individual') => {
  mockUseUserContext.mockReturnValue(buildUserContext(type));
  mockGetAccountById.mockResolvedValue({
    data: { type, uid: 'auth-owner' },
    id: 'account-1'
  });
  mockGetProfileById.mockResolvedValue({
    data: { account_id: 'account-1', uid: 'auth-owner' },
    id: 'profile-1'
  });

  render(<Profile />);

  const profileMock =
    type === 'company'
      ? routeMocks.companyProfile
      : routeMocks.individualProfile;
  await waitFor(() => expect(profileMock).toHaveBeenCalled());

  return profileMock.mock.calls.at(-1)?.[0];
};

describe('Profile route preview mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routeMocks.accountId = undefined;
  });

  it.each(['individual', 'company'] as const)(
    'uses preview mode for a public self-view of an %s account',
    async (type) => {
      routeMocks.accountId = 'account-1';

      const props = await renderOwnerProfile(type);

      expect(props).toEqual(expect.objectContaining({ previewMode: true }));
      expect(mockGetAccountById).toHaveBeenCalledWith('account-1');
      expect(mockGetProfileById).toHaveBeenCalledWith('profile-1');
    }
  );

  it('keeps the owner route out of preview mode', async () => {
    const props = await renderOwnerProfile('individual');

    expect(props).toEqual(expect.objectContaining({ previewMode: false }));
  });
});
