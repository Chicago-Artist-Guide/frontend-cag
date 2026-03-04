import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import IndividualProfile from './index';
import type { UserContextType } from '../../../context/UserContext';
import { useUserContext } from '../../../context/UserContext';

vi.mock('../../../context/UserContext', () => ({
  useUserContext: vi.fn()
}));

const mockUseUserContext = vi.mocked(useUserContext);

const buildUserContextValue = (): UserContextType => ({
  account: {
    id: 'account-1',
    ref: null,
    data: {
      first_name: 'Casey',
      last_name: 'Artist'
    }
  },
  setAccountRef: vi.fn(),
  profile: {
    id: 'profile-1',
    ref: null,
    data: {
      profile_image_url: '',
      age_ranges: [],
      gender_identity: 'Cis Woman',
      ethnicities: ['Asian'],
      union_status: [],
      additional_skills_checkboxes: [],
      additional_skills_manual: [],
      websites: []
    }
  },
  setProfileRef: vi.fn(),
  setAccountData: vi.fn(),
  setProfileData: vi.fn(),
  currentUser: null,
  setCurrentUser: vi.fn()
});

describe('IndividualProfile privacy rendering', () => {
  beforeEach(() => {
    mockUseUserContext.mockReturnValue(buildUserContextValue());
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
