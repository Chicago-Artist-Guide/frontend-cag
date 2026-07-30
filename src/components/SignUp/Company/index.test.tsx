import { act, render } from '@testing-library/react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUserContext } from '../../../context/UserContext';
import { createAccount } from '../../../services/accounts/client';
import {
  createProfile,
  updateProfile
} from '../../../services/profiles/client';
import CompanySignUp from './index';

const mocks = vi.hoisted(() => ({
  footerProps: {} as Record<string, any>,
  formData: {
    emailAddress: 'company@example.com',
    password: 'password',
    theatreName: 'CAG Theatre',
    numberOfMembers: '10',
    primaryContact: 'Casey Producer',
    primaryContactEmail: 'casey@example.com',
    location: 'Chicago',
    description: 'A theatre company',
    profilePhotoUrl: 'https://images.test/company.jpg'
  },
  navigate: vi.fn(),
  setAccount: vi.fn(),
  setProfile: vi.fn()
}));

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn()
}));

vi.mock('react-hooks-helper', () => ({
  useForm: () => [mocks.formData, vi.fn()],
  useStep: () => ({
    navigation: { next: vi.fn(), previous: vi.fn() },
    step: { id: 'basics' }
  })
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => mocks.navigate
}));

vi.mock('../../../context/FirebaseContext', () => ({
  useFirebaseContext: () => ({ firebaseAuth: {} })
}));

vi.mock('../../../context/MarketingContext', () => ({
  useMarketingContext: () => ({ lglApiKey: 'lgl-key' })
}));

vi.mock('../../../context/UserContext', () => ({
  useUserContext: vi.fn()
}));

vi.mock('../../../services/accounts/client', () => ({
  createAccount: vi.fn()
}));

vi.mock('../../../services/profiles/client', () => ({
  createProfile: vi.fn(),
  updateProfile: vi.fn()
}));

vi.mock('../../../utils/marketing', () => ({
  submitLGLConstituent: vi.fn()
}));

vi.mock('./SignUpFooter', () => ({
  default: (props: Record<string, any>) => {
    mocks.footerProps = props;
    return null;
  }
}));

vi.mock('./Basics', () => ({ default: () => null }));

const mockCreateUser = vi.mocked(createUserWithEmailAndPassword);
const mockCreateAccount = vi.mocked(createAccount);
const mockCreateProfile = vi.mocked(createProfile);
const mockUpdateProfile = vi.mocked(updateProfile);
const mockUseUserContext = vi.mocked(useUserContext);

const accountDto = {
  id: 'account-1',
  data: {
    uid: 'user-1',
    type: 'company' as const,
    email: 'company@example.com',
    theater_name: 'CAG Theatre'
  }
};
const profileDto = {
  id: 'profile-1',
  data: { uid: 'user-1', account_id: 'account-1' }
};

const contextValue = (profileId: string | null) => ({
  account: { id: null, data: null },
  currentUser: null,
  profile:
    profileId === null
      ? { id: null, data: null }
      : { id: profileId, data: profileDto.data },
  setAccount: mocks.setAccount,
  setAccountData: vi.fn(),
  setCurrentUser: vi.fn(),
  setProfile: mocks.setProfile,
  setProfileData: vi.fn()
});

describe('CompanySignUp DTO workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.footerProps = {};
    mockCreateUser.mockResolvedValue({ user: { uid: 'user-1' } } as any);
    mockCreateAccount.mockResolvedValue(accountDto);
    mockCreateProfile.mockResolvedValue(profileDto);
    mockUpdateProfile.mockResolvedValue();
    mockUseUserContext.mockReturnValue(contextValue('profile-1'));
  });

  it('stores the account and profile DTOs returned by the create services', async () => {
    render(<CompanySignUp currentStep={0} setCurrentStep={vi.fn()} />);

    await act(async () => {
      expect(await mocks.footerProps.submitBasics()).toEqual({ ok: true });
    });

    expect(mockCreateAccount).toHaveBeenCalledWith({
      uid: 'user-1',
      type: 'company',
      email: 'company@example.com',
      theater_name: 'CAG Theatre',
      privacy_agreement: true
    });
    expect(mockCreateProfile).toHaveBeenCalledWith({
      uid: 'user-1',
      account_id: 'account-1'
    });
    expect(mocks.setAccount).toHaveBeenCalledWith(accountDto);
    expect(mocks.setProfile).toHaveBeenCalledWith(profileDto);
  });

  it('updates the current profile ID with the exact completed-profile payload', async () => {
    render(<CompanySignUp currentStep={0} setCurrentStep={vi.fn()} />);

    await act(async () => {
      await mocks.footerProps.completeSignUp();
    });

    expect(mockUpdateProfile).toHaveBeenCalledWith('profile-1', {
      theatre_name: 'CAG Theatre',
      number_of_members: '10',
      primary_contact: 'Casey Producer',
      primary_contact_email: 'casey@example.com',
      location: 'Chicago',
      description: 'A theatre company',
      profile_image_url: 'https://images.test/company.jpg',
      complete_profile: true
    });
  });

  it('does not write completed profile data when the profile ID is missing', async () => {
    mockUseUserContext.mockReturnValue(contextValue(null));
    render(<CompanySignUp currentStep={0} setCurrentStep={vi.fn()} />);

    await act(async () => {
      await mocks.footerProps.completeSignUp();
    });

    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });
});
