import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDoc, updateDoc } from 'firebase/firestore';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { sendDeferredDeclineNotifications } from '../components/Matches/declineNotifications';
import { useFirebaseContext } from '../context/FirebaseContext';
import { useUserContext } from '../context/UserContext';
import ManageProduction from '../routes/ManageProduction';

vi.mock('firebase/firestore', () => ({
  deleteDoc: vi.fn(),
  doc: vi.fn((_store, ...segments) => ({
    path: segments.join('/')
  })),
  getDoc: vi.fn(),
  updateDoc: vi.fn()
}));

vi.mock('../context/FirebaseContext', () => ({
  useFirebaseContext: vi.fn()
}));

vi.mock('../context/UserContext', () => ({
  useUserContext: vi.fn()
}));

vi.mock('../components/Matches/declineNotifications', () => ({
  sendDeferredDeclineNotifications: vi.fn()
}));

vi.mock('../components/ConfirmDialog', async () => {
  const ReactModule = await import('react');

  return {
    default: ({ content, onCancel, onConfirm, show, title }: any) =>
      show
        ? ReactModule.createElement(
            'div',
            {
              'aria-label': title,
              role: 'dialog'
            },
            ReactModule.createElement('p', null, content),
            ReactModule.createElement(
              'button',
              {
                onClick: onConfirm,
                type: 'button'
              },
              'Confirm'
            ),
            ReactModule.createElement(
              'button',
              {
                onClick: onCancel,
                type: 'button'
              },
              'Cancel'
            )
          )
        : null
  };
});

vi.mock(
  '../components/Profile/Company/Production/Manage/ManageProductionBasic',
  async () => {
    const ReactModule = await import('react');

    return {
      default: ({ formValues, setFormValues }: any) =>
        ReactModule.createElement(
          'div',
          null,
          ReactModule.createElement(
            'div',
            null,
            `Status: ${formValues.status || ''}`
          ),
          ReactModule.createElement(
            'button',
            {
              onClick: () =>
                setFormValues({
                  target: {
                    name: 'status',
                    value: 'In Production'
                  }
                }),
              type: 'button'
            },
            'Set In Production'
          )
        )
    };
  }
);

vi.mock(
  '../components/Profile/Company/Production/Manage/ManageProductionRoles',
  () => ({
    default: () => null
  })
);

vi.mock('../components/Profile/Company/Production/Manage/ManageAuditionInfo', () => ({
  default: () => null
}));

vi.mock('../components/Profile/Company/Production/Manage/ManageOffStageInfo', () => ({
  default: () => null
}));

vi.mock(
  '../components/Profile/Company/Production/Manage/ManageProductionMatches',
  () => ({
    default: () => null
  })
);

const mockGetDoc = vi.mocked(getDoc);
const mockUpdateDoc = vi.mocked(updateDoc);
const mockUseFirebaseContext = vi.mocked(useFirebaseContext);
const mockUseUserContext = vi.mocked(useUserContext);
const mockSendDeferredDeclineNotifications = vi.mocked(
  sendDeferredDeclineNotifications
);

const store = {};

const production = {
  account_id: 'theater-1',
  location: 'Chicago',
  production_id: 'production-1',
  production_name: 'Demo Show',
  roles: [],
  status: 'Hiring'
};

const renderManageProduction = () =>
  render(
    <MemoryRouter initialEntries={['/productions/production-1/manage']}>
      <Routes>
        <Route
          element={<ManageProduction />}
          path="/productions/:productionId/manage"
        />
      </Routes>
    </MemoryRouter>
  );

describe('ManageProduction decline notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDoc.mockResolvedValue({
      data: () => production,
      exists: () => true
    } as any);
    mockUpdateDoc.mockResolvedValue(undefined as any);
    mockSendDeferredDeclineNotifications.mockResolvedValue(1);
    mockUseFirebaseContext.mockReturnValue({
      firebaseFirestore: store
    } as any);
    mockUseUserContext.mockReturnValue({
      account: {
        data: {
          account_id: 'theater-1',
          uid: 'theater-1'
        }
      },
      profile: {
        data: {
          theatre_name: 'Demo Theatre'
        }
      }
    } as any);
  });

  it('confirms and sends deferred decline notices when Hiring moves to In Production', async () => {
    renderManageProduction();

    await screen.findByText('Status: Hiring');
    await userEvent.click(
      screen.getByRole('button', { name: 'Set In Production' })
    );
    await userEvent.click(screen.getAllByRole('button', { name: /save show/i })[0]);

    expect(
      screen.getByRole('dialog', { name: /send decline notices/i })
    ).toBeInTheDocument();
    expect(mockUpdateDoc).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(mockUpdateDoc).toHaveBeenCalled();
    });
    expect(mockSendDeferredDeclineNotifications).toHaveBeenCalledWith(
      store,
      expect.objectContaining({
        production_id: 'production-1',
        status: 'In Production'
      }),
      'theater-1',
      'Demo Theatre'
    );
  });

  it('aborts the save when the decline notice confirmation is canceled', async () => {
    renderManageProduction();

    await screen.findByText('Status: Hiring');
    await userEvent.click(
      screen.getByRole('button', { name: 'Set In Production' })
    );
    await userEvent.click(screen.getAllByRole('button', { name: /save show/i })[0]);
    await userEvent.click(
      within(
        screen.getByRole('dialog', { name: /send decline notices/i })
      ).getByRole('button', { name: 'Cancel' })
    );

    expect(mockUpdateDoc).not.toHaveBeenCalled();
    expect(mockSendDeferredDeclineNotifications).not.toHaveBeenCalled();
  });

  it('saves without decline notices when status does not move to In Production', async () => {
    renderManageProduction();

    await screen.findByText('Status: Hiring');
    await userEvent.click(screen.getAllByRole('button', { name: /save show/i })[0]);

    await waitFor(() => {
      expect(mockUpdateDoc).toHaveBeenCalled();
    });
    expect(
      screen.queryByRole('dialog', { name: /send decline notices/i })
    ).not.toBeInTheDocument();
    expect(mockSendDeferredDeclineNotifications).not.toHaveBeenCalled();
  });
});
