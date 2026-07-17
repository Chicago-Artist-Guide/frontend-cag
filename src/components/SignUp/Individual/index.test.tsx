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
import IndividualSignUp from './index';

const mocks = vi.hoisted(() => ({
  footerProps: {} as Record<string, any>,
  formData: {
    actorInfo1Ethnicities: ['Asian'],
    actorInfo1LGBTQ: 'Yes',
    actorInfo1Pronouns: 'She/Her',
    actorInfo1PronounsOther: '',
    actorInfo2AgeRanges: ['20s'],
    actorInfo2Gender: 'Cis Woman',
    actorInfo2GenderRoles: ['Woman'],
    actorInfo2GenderTransition: '',
    actorInfo2HeightFt: 5,
    actorInfo2HeightIn: 8,
    actorInfo2HeightNoAnswer: false,
    basics18Plus: true,
    basicsEmailAddress: 'artist@example.com',
    basicsFirstName: 'Casey',
    basicsLastName: 'Artist',
    basicsPassword: 'password',
    basicsPasswordConfirm: 'password',
    demographicsAgency: 'North Star',
    demographicsBioHeadline: 'Chicago actor',
    demographicsBio: 'Biography',
    demographicsUnionStatus: ['Non-Union'],
    demographicsUnionStatusOther: '',
    demographicsWebsites: [
      { id: 1, url: 'https://artist.test', websiteType: 'Portfolio' }
    ],
    emailListAgree: false,
    actorInfoSinging: 'Yes',
    actorInfoDancing: 'No',
    offstageRolesGeneral: ['Artistic Director'],
    offstageRolesHairMakeupCostumes: [],
    offstageRolesLighting: [],
    offstageRolesProduction: ['Producer'],
    offstageRolesScenicAndProperties: [],
    offstageRolesSound: [],
    privacyAgreement: true,
    profilePhotoUrl: 'https://images.test/artist.jpg',
    stageRole: 'both-stage'
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
    index: 0,
    navigation: { next: vi.fn(), previous: vi.fn() },
    step: { id: 'role' }
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

vi.mock('./Role', () => ({ default: () => null }));

const mockCreateUser = vi.mocked(createUserWithEmailAndPassword);
const mockCreateAccount = vi.mocked(createAccount);
const mockCreateProfile = vi.mocked(createProfile);
const mockUpdateProfile = vi.mocked(updateProfile);
const mockUseUserContext = vi.mocked(useUserContext);

const profileDto = {
  id: 'profile-1',
  data: {
    uid: 'user-1',
    account_id: 'account-1',
    stage_role: 'both-stage',
    completed_signup: true,
    completed_profile_1: false,
    completed_profile_2: false
  }
};

describe('IndividualSignUp DTO workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.footerProps = {};
    mockCreateUser.mockResolvedValue({ user: { uid: 'user-1' } } as any);
    mockCreateAccount.mockResolvedValue({
      id: 'account-1',
      data: {
        uid: 'user-1',
        type: 'individual',
        email: 'artist@example.com'
      }
    });
    mockCreateProfile.mockResolvedValue(profileDto);
    mockUpdateProfile.mockResolvedValue();
    mockUseUserContext.mockReturnValue({
      account: { id: null, data: null },
      currentUser: null,
      profile: { id: 'profile-1', data: profileDto.data },
      setAccount: mocks.setAccount,
      setAccountData: vi.fn(),
      setCurrentUser: vi.fn(),
      setProfile: mocks.setProfile,
      setProfileData: vi.fn()
    });
  });

  it('stores the account and profile DTOs returned by the create services', async () => {
    render(<IndividualSignUp currentStep={0} setCurrentStep={vi.fn()} />);

    await act(async () => {
      expect(await mocks.footerProps.submitBasics()).toEqual({ ok: true });
    });

    expect(mockCreateAccount).toHaveBeenCalledWith({
      type: 'individual',
      basics_18_plus: true,
      email_list: false,
      first_name: 'Casey',
      last_name: 'Artist',
      privacy_agreement: true,
      email: 'artist@example.com',
      uid: 'user-1'
    });
    expect(mockCreateProfile).toHaveBeenCalledWith({
      uid: 'user-1',
      account_id: 'account-1',
      stage_role: 'both-stage',
      completed_signup: true,
      completed_profile_1: false,
      completed_profile_2: false
    });
    expect(mocks.setAccount).toHaveBeenCalledWith(
      await mockCreateAccount.mock.results[0].value
    );
    expect(mocks.setProfile).toHaveBeenCalledWith(profileDto);
  });

  it('updates the current profile ID with the exact completed-profile payload', async () => {
    render(<IndividualSignUp currentStep={0} setCurrentStep={vi.fn()} />);

    await act(async () => {
      await mocks.footerProps.submitSignUpProfile();
    });

    expect(mockUpdateProfile).toHaveBeenCalledWith('profile-1', {
      pronouns: 'She/Her',
      pronouns_other: '',
      lgbtqia: 'Yes',
      ethnicities: ['Asian'],
      height_ft: 5,
      height_in: 8,
      height_no_answer: false,
      age_ranges: ['20s'],
      gender_identity: 'Cis Woman',
      gender_roles: ['Woman'],
      gender_transition: '',
      offstage_roles_general: ['Artistic Director'],
      offstage_roles_production: ['Producer'],
      offstage_roles_scenic_and_properties: [],
      offstage_roles_lighting: [],
      offstage_roles_sound: [],
      offstage_roles_hair_makeup_costumes: [],
      profile_image_url: 'https://images.test/artist.jpg',
      union_status: ['Non-Union'],
      union_other: '',
      agency: 'North Star',
      websites: [
        { id: 1, url: 'https://artist.test', websiteType: 'Portfolio' }
      ],
      headline: 'Chicago actor',
      bio: 'Biography',
      profile_tagline: 'Actor, Offstage Professional',
      additional_skills_checkboxes: ['Singing'],
      completed_profile: true,
      completed_profile_1: true
    });
  });

  it('does not write completed profile data when the profile ID is missing', async () => {
    mockUseUserContext.mockReturnValue({
      account: { id: null, data: null },
      currentUser: null,
      profile: { id: null, data: null },
      setAccount: mocks.setAccount,
      setAccountData: vi.fn(),
      setCurrentUser: vi.fn(),
      setProfile: mocks.setProfile,
      setProfileData: vi.fn()
    });
    render(<IndividualSignUp currentStep={0} setCurrentStep={vi.fn()} />);

    await act(async () => {
      await mocks.footerProps.submitSignUpProfile();
    });

    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });
});
