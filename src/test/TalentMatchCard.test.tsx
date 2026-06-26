import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Swal from 'sweetalert2';
import { vi } from 'vitest';
import { TalentMatchCard } from '../components/Matches/TalentMatchCard';
import { createTheaterTalentMatch } from '../components/Matches/api';
import { useFirebaseContext } from '../context/FirebaseContext';
import { useUserContext } from '../context/UserContext';
import { createMessageThread, createEmail } from '../components/Messages/api';
import { getAccountWithAccountId } from '../components/Profile/shared/api';

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn()
  }
}));

vi.mock('../context/FirebaseContext', () => ({
  useFirebaseContext: vi.fn()
}));

vi.mock('../context/UserContext', () => ({
  useUserContext: vi.fn()
}));

vi.mock('../components/Matches/api', () => ({
  createTheaterTalentMatch: vi.fn()
}));

vi.mock('../components/Messages/api', () => ({
  createEmail: vi.fn(),
  createMessageThread: vi.fn()
}));

vi.mock('../components/Profile/shared/api', () => ({
  getAccountWithAccountId: vi.fn()
}));

const mockCreateMessageThread = vi.mocked(createMessageThread);
const mockCreateEmail = vi.mocked(createEmail);
const mockGetAccountWithAccountId = vi.mocked(getAccountWithAccountId);

const mockUseFirebaseContext = vi.mocked(useFirebaseContext);
const mockUseUserContext = vi.mocked(useUserContext);
const mockCreateTheaterTalentMatch = vi.mocked(createTheaterTalentMatch);
const mockSwalFire = vi.mocked(Swal.fire);

const mockProfile = {
  account_id: 'talent-1',
  additional_skills_checkboxes: [],
  additional_skills_manual: [],
  fullName: 'Casey Artist',
  matchStatus: null,
  profile_image_url: '',
  union_status: []
};

const renderTalentMatchCard = () =>
  render(
    <MemoryRouter>
      <TalentMatchCard
        fetchFullNames={vi.fn().mockResolvedValue(undefined)}
        isFavorited={false}
        onToggleFavorite={vi.fn().mockResolvedValue(undefined)}
        productionId="production-1"
        productionName="Demo Show"
        profile={mockProfile as any}
        roleId="role-1"
        roleName="Lead"
      />
    </MemoryRouter>
  );

const store = {};

describe('TalentMatchCard decline action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateTheaterTalentMatch.mockResolvedValue({ id: 'match-1' } as any);
    mockUseFirebaseContext.mockReturnValue({
      firebaseFirestore: store
    } as any);
    mockUseUserContext.mockReturnValue({
      account: {
        ref: {
          id: 'theater-1'
        }
      },
      currentUser: {
        email: 'theater@example.com'
      },
      profile: {
        data: {
          primary_contact_email: 'contact@example.com',
          theatre_name: 'Demo Theatre'
        }
      }
    } as any);
  });

  describe('Accept action', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockCreateTheaterTalentMatch.mockResolvedValue({ id: 'match-1' } as any);
      mockGetAccountWithAccountId.mockResolvedValue({
        email: 'talent@example.com'
      } as any);
      mockUseFirebaseContext.mockReturnValue({
        firebaseFirestore: store
      } as any);
      mockUseUserContext.mockReturnValue({
        account: { ref: { id: 'theater-1' } },
        currentUser: { email: 'theater@example.com' },
        profile: {
          data: {
            primary_contact_email: 'contact@example.com',
            theatre_name: 'Demo Theatre'
          }
        }
      } as any);
    });

    it('creates match thread and sends email when theater accepts artist', async () => {
      renderTalentMatchCard();

      await userEvent.click(screen.getByRole('button', { name: /accept/i }));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /^confirm$/i })).toBeInTheDocument()
      );
      await userEvent.click(screen.getByRole('button', { name: /^confirm$/i }));

      await waitFor(() => {
        expect(mockCreateTheaterTalentMatch).toHaveBeenCalledWith(
          store,
          'production-1',
          'role-1',
          'talent-1',
          true,
          'theater'
        );
      });

      expect(mockCreateMessageThread).toHaveBeenCalledWith(
        store,
        'theater-1',
        'talent-1',
        expect.stringContaining('Lead'),
        'theater',
        'production-1',
        'role-1'
      );

      expect(mockCreateEmail).toHaveBeenCalledWith(
        store,
        'talent@example.com',
        expect.stringContaining('Lead'),
        expect.stringContaining('Demo Show'),
        expect.any(String)
      );
    });
  });

  describe('Decline action', () => {
    it('explains declined artists are notified when the show moves to In Production', async () => {
      renderTalentMatchCard();

      await userEvent.click(screen.getByRole('button', { name: /decline/i }));

      await waitFor(() =>
        expect(mockCreateTheaterTalentMatch).toHaveBeenCalledWith(
          store,
          'production-1',
          'role-1',
          'talent-1',
          false,
          'theater'
        )
      );
      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'info',
          text: expect.stringMatching(/in production/i),
          title: expect.stringMatching(/declined/i)
        })
      );
    });
  });
});
