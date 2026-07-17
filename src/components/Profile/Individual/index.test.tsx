import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserContextType } from '../../../context/UserContext';
import { useUserContext } from '../../../context/UserContext';
import {
  subscribeToAccount,
  updateAccount
} from '../../../services/accounts/client';
import {
  subscribeToProfile,
  updateProfile
} from '../../../services/profiles/client';
import IndividualProfile from './index';

vi.mock('../../../context/UserContext', () => ({
  useUserContext: vi.fn()
}));

vi.mock('../../../services/accounts/client', () => ({
  subscribeToAccount: vi.fn(),
  updateAccount: vi.fn()
}));

vi.mock('../../../services/profiles/client', () => ({
  subscribeToProfile: vi.fn(),
  updateProfile: vi.fn()
}));

vi.mock('../../../components/shared', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../../components/shared')>();

  return {
    ...actual,
    ImageUploadComponent: ({ onSave }: { onSave: (url: string) => void }) => (
      <button
        onClick={() => onSave('https://images.test/new.jpg')}
        type="button"
      >
        Upload profile image
      </button>
    )
  };
});

vi.mock('./EditPersonalDetails', () => ({
  default: ({
    updatePersonalDetails
  }: {
    updatePersonalDetails: () => void;
  }) => (
    <button onClick={updatePersonalDetails} type="button">
      Save personal details
    </button>
  )
}));

vi.mock('./ProfileSections/Edits/FeaturesEdit', () => ({
  default: ({
    features,
    removeCreditBlock
  }: {
    features: Array<{ id: number }>;
    removeCreditBlock: (event: React.MouseEvent, id: number) => void;
  }) => (
    <button
      onClick={(event) => removeCreditBlock(event, features[0].id)}
      type="button"
    >
      Clear features
    </button>
  )
}));

const offstagePatch = {
  offstage_roles_general: ['Artistic Director'],
  offstage_roles_production: ['Producer']
};

vi.mock('./ProfileSections/Edits/OffStageSkillsEdit', () => ({
  default: ({
    submitOffStageSkills
  }: {
    submitOffStageSkills: (patch: typeof offstagePatch) => void;
  }) => (
    <button onClick={() => submitOffStageSkills(offstagePatch)} type="button">
      Save offstage skills
    </button>
  )
}));

const mockUseUserContext = vi.mocked(useUserContext);
const mockSubscribeToAccount = vi.mocked(subscribeToAccount);
const mockSubscribeToProfile = vi.mocked(subscribeToProfile);
const mockUpdateAccount = vi.mocked(updateAccount);
const mockUpdateProfile = vi.mocked(updateProfile);

const profileData = {
  account_id: 'account-1',
  uid: 'user-1',
  profile_image_url: 'https://images.test/current.jpg',
  age_ranges: ['20s'],
  height_ft: '5',
  height_in: '8',
  height_no_answer: false,
  gender_identity: 'Cis Woman',
  gender_roles: ['Woman'],
  ethnicities: ['Asian'],
  lgbtqia: 'Yes',
  union_status: ['Non-Union'],
  union_other: '',
  agency: 'North Star Talent',
  websites: [{ id: 1, url: 'artist.test', websiteType: 'Portfolio' }],
  pronouns: 'She/Her',
  pronouns_other: '',
  profile_tagline: 'Actor and singer',
  bio: 'Chicago artist',
  training_institutions: [
    {
      id: 1,
      trainingDegree: 'BFA',
      trainingInstitution: 'CAG Conservatory',
      trainingYear: '2020'
    }
  ],
  upcoming_performances: [{ id: 1, title: 'The Tempest' }],
  additional_skills_checkboxes: ['Singing'],
  additional_skills_manual: ['Stage combat'],
  offstage_roles_general: [],
  offstage_roles_production: [],
  offstage_roles_scenic_and_properties: [],
  offstage_roles_lighting: [],
  offstage_roles_sound: [],
  offstage_roles_hair_makeup_costumes: []
};

const buildUserContextValue = (
  overrides: Partial<UserContextType> = {}
): UserContextType => ({
  account: {
    id: 'account-1',
    data: {
      uid: 'user-1',
      type: 'individual',
      first_name: 'Casey',
      last_name: 'Artist'
    }
  },
  setAccount: vi.fn(),
  profile: {
    id: 'profile-1',
    data: profileData
  },
  setProfile: vi.fn(),
  setAccountData: vi.fn(),
  setProfileData: vi.fn(),
  currentUser: null,
  setCurrentUser: vi.fn(),
  ...overrides
});

const clickPersonalDetailsEdit = () => {
  const personalDetails = screen.getByText('Personal Details');
  const editLink = personalDetails.parentElement?.querySelector('a');

  if (!editLink) throw new Error('Personal details edit link not found');
  fireEvent.click(editLink);
};

const clickHeadlineEdit = () => {
  const heading = screen.getByRole('heading', { name: 'Casey Artist' });
  const editLink = heading.parentElement?.parentElement?.querySelector('a');

  if (!editLink) throw new Error('Headline edit link not found');
  fireEvent.click(editLink);
};

describe('IndividualProfile service boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserContext.mockReturnValue(buildUserContextValue());
    mockSubscribeToAccount.mockReturnValue(vi.fn());
    mockSubscribeToProfile.mockReturnValue(vi.fn());
    mockUpdateAccount.mockResolvedValue();
    mockUpdateProfile.mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('subscribes once to the owner profile and account IDs and cleans up both', () => {
    const unsubscribeProfile = vi.fn();
    const unsubscribeAccount = vi.fn();
    const context = buildUserContextValue();
    mockUseUserContext.mockReturnValue(context);
    mockSubscribeToProfile.mockReturnValue(unsubscribeProfile);
    mockSubscribeToAccount.mockReturnValue(unsubscribeAccount);

    const { unmount } = render(<IndividualProfile />);

    expect(mockSubscribeToProfile).toHaveBeenCalledTimes(1);
    expect(mockSubscribeToProfile).toHaveBeenCalledWith(
      'profile-1',
      expect.any(Function)
    );
    expect(mockSubscribeToAccount).toHaveBeenCalledTimes(1);
    expect(mockSubscribeToAccount).toHaveBeenCalledWith(
      'account-1',
      expect.any(Function)
    );

    const profileListener = mockSubscribeToProfile.mock.calls[0][1];
    const accountListener = mockSubscribeToAccount.mock.calls[0][1];
    profileListener({ id: 'profile-1', data: { ...profileData, bio: 'New' } });
    accountListener({
      id: 'account-1',
      data: { uid: 'user-1', type: 'individual', first_name: 'New' }
    });
    expect(context.setProfileData).toHaveBeenCalledWith({
      ...profileData,
      bio: 'New'
    });
    expect(context.setAccountData).toHaveBeenCalledWith({
      uid: 'user-1',
      type: 'individual',
      first_name: 'New'
    });

    unmount();
    expect(unsubscribeProfile).toHaveBeenCalledTimes(1);
    expect(unsubscribeAccount).toHaveBeenCalledTimes(1);
  });

  it('does not subscribe in preview mode', () => {
    render(<IndividualProfile previewMode />);

    expect(mockSubscribeToProfile).not.toHaveBeenCalled();
    expect(mockSubscribeToAccount).not.toHaveBeenCalled();
  });

  it('writes the profile picture with the profile ID and exact patch', async () => {
    render(<IndividualProfile />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Upload profile image' })
    );

    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith('profile-1', {
        profile_image_url: 'https://images.test/new.jpg'
      })
    );
  });

  it('writes the exact personal-details patch', async () => {
    render(<IndividualProfile />);
    clickPersonalDetailsEdit();
    fireEvent.click(
      screen.getByRole('button', { name: 'Save personal details' })
    );

    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith('profile-1', {
        age_ranges: ['20s'],
        height_ft: '5',
        height_in: '8',
        height_no_answer: false,
        gender_identity: 'Cis Woman',
        gender_roles: [],
        ethnicities: ['Asian'],
        lgbtqia: 'Yes',
        union_status: ['Non-Union'],
        union_other: '',
        agency: 'North Star Talent',
        websites: [{ id: 1, url: 'artist.test', websiteType: 'Portfolio' }]
      })
    );
  });

  it('awaits the headline account write before writing the profile', async () => {
    let finishAccountWrite = () => undefined;
    mockUpdateAccount.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishAccountWrite = resolve;
        })
    );
    render(<IndividualProfile />);
    clickHeadlineEdit();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockUpdateAccount).toHaveBeenCalledWith('account-1', {
      first_name: 'Casey',
      last_name: 'Artist'
    });
    expect(mockUpdateProfile).not.toHaveBeenCalled();

    finishAccountWrite();
    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith('profile-1', {
        pronouns: 'She/Her',
        pronouns_other: '',
        profile_tagline: 'Actor and singer',
        bio: 'Chicago artist'
      })
    );
  });

  it('writes exact value and cleared section patches', async () => {
    const { unmount } = render(<IndividualProfile />);
    fireEvent.click(screen.getByText('+ Add Training'));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith('profile-1', {
        training_institutions: profileData.training_institutions
      })
    );
    unmount();

    mockUpdateProfile.mockClear();
    render(<IndividualProfile />);
    fireEvent.click(screen.getByText('+ Add Upcoming Features'));
    fireEvent.click(screen.getByRole('button', { name: 'Clear features' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith('profile-1', {
        upcoming_performances: []
      })
    );
  });

  it('writes the exact skills patch', async () => {
    render(<IndividualProfile />);
    fireEvent.click(screen.getByText('+ Add Skills'));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith('profile-1', {
        additional_skills_checkboxes: ['Singing'],
        additional_skills_manual: ['Stage combat']
      })
    );
  });

  it('writes the exact offstage fields patch', async () => {
    render(<IndividualProfile />);
    fireEvent.click(screen.getByText('+ Add Off Stage Roles'));
    fireEvent.click(
      screen.getByRole('button', { name: 'Save offstage skills' })
    );

    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith('profile-1', offstagePatch)
    );
  });

  it('keeps missing IDs as no-ops and preserves the offstage error', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    mockUseUserContext.mockReturnValue(
      buildUserContextValue({
        account: {
          id: null,
          ref: null,
          data: { first_name: 'Casey', last_name: 'Artist' }
        },
        profile: { id: null, ref: null, data: profileData }
      })
    );
    render(<IndividualProfile />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Upload profile image' })
    );
    fireEvent.click(screen.getByText('+ Add Off Stage Roles'));
    fireEvent.click(
      screen.getByRole('button', { name: 'Save offstage skills' })
    );

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith('No profile ref found')
    );
    expect(mockUpdateProfile).not.toHaveBeenCalled();
    expect(mockUpdateAccount).not.toHaveBeenCalled();
  });
});

describe('IndividualProfile privacy rendering', () => {
  beforeEach(() => {
    mockUseUserContext.mockReturnValue(buildUserContextValue());
    mockSubscribeToAccount.mockReturnValue(vi.fn());
    mockSubscribeToProfile.mockReturnValue(vi.fn());
  });

  it('shows private demographics to the profile owner', () => {
    render(<IndividualProfile previewMode={false} />);

    expect(screen.getByText(/Gender Identity: Cis Woman/i)).toBeInTheDocument();
    expect(screen.getByText(/Ethnicity: Asian/i)).toBeInTheDocument();
  });

  it('hides private demographics in preview mode', () => {
    render(<IndividualProfile previewMode={true} />);

    expect(screen.queryByText(/Gender Identity:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ethnicity:/i)).not.toBeInTheDocument();
  });
});
