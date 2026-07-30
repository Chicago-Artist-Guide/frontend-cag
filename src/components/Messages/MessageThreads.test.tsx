import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const state = vi.hoisted(() => ({
  account: { data: null as { type: string } | null, id: '' },
  clearMessages: vi.fn(),
  firebaseFirestore: {},
  loadThreads: vi.fn(),
  messageContext: {
    threads: [] as Array<{
      created_at: Date;
      id: string;
      last_message: { content: string; message_id: string; timestamp: Date };
      talent_account_id: string;
      talent_status: string;
      theater_account_id: string;
      theater_status: string;
      updated_at: Date;
    }>,
    threadsAccountId: null as string | null
  }
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({})
}));
vi.mock('../../context/UserContext', () => ({
  useUserContext: () => ({ account: state.account })
}));
vi.mock('../../context/FirebaseContext', () => ({
  useFirebaseContext: () => ({
    firebaseFirestore: state.firebaseFirestore
  })
}));
vi.mock('../../context/MessageContext', () => ({
  useMessages: () => ({
    clearMessages: state.clearMessages,
    loadThreads: state.loadThreads,
    threads: state.messageContext.threads,
    threadsAccountId: state.messageContext.threadsAccountId
  })
}));
vi.mock('../../services/accounts/client', () => ({
  getAccountDisplayName: vi.fn(),
  getTheaterDisplayNameByUid: vi.fn()
}));
vi.mock('../../services/profiles/client', () => ({
  findProfileByUidOrAccountId: vi.fn()
}));
vi.mock('../Profile/Company/api', () => ({ getProduction: vi.fn() }));

import MessageThreads from './MessageThreads';
import { getAccountDisplayName } from '../../services/accounts/client';
import { findProfileByUidOrAccountId } from '../../services/profiles/client';

const getAccountDisplayNameMock = vi.mocked(getAccountDisplayName);
const findProfileByUidOrAccountIdMock = vi.mocked(findProfileByUidOrAccountId);

describe('MessageThreads account boundary', () => {
  beforeEach(() => {
    state.account.id = '';
    state.account.data = null;
    state.messageContext.threads = [];
    state.messageContext.threadsAccountId = null;
    state.clearMessages.mockReset();
    state.loadThreads.mockReset();
    getAccountDisplayNameMock.mockReset();
    findProfileByUidOrAccountIdMock.mockReset();
  });

  it('does not construct a Firestore account reference for a missing account ID', async () => {
    render(<MessageThreads onThreadSelect={vi.fn()} />);

    await waitFor(() => expect(state.loadThreads).not.toHaveBeenCalled());
    expect(state.clearMessages).toHaveBeenCalledOnce();
  });

  it('loads threads with the exact non-empty DTO account ID', async () => {
    state.account.id = 'account-123';
    state.loadThreads.mockResolvedValue(undefined);

    render(<MessageThreads onThreadSelect={vi.fn()} />);

    await waitFor(() =>
      expect(state.loadThreads).toHaveBeenCalledExactlyOnceWith('account-123')
    );
  });

  it('removes prior-account previews immediately when the account resets', async () => {
    state.account.id = 'account-123';
    state.account.data = { type: 'company' };
    state.messageContext.threadsAccountId = 'account-123';
    state.messageContext.threads = [
      {
        created_at: new Date(0),
        id: 'thread-1',
        last_message: {
          content: 'Sensitive preview',
          message_id: 'message-1',
          timestamp: new Date(0)
        },
        talent_account_id: 'recipient-1',
        talent_status: 'read',
        theater_account_id: 'account-123',
        theater_status: 'read',
        updated_at: new Date(0)
      }
    ];
    getAccountDisplayNameMock.mockResolvedValue('Prior Recipient');
    findProfileByUidOrAccountIdMock.mockResolvedValue(false);

    const view = render(<MessageThreads onThreadSelect={vi.fn()} />);
    await screen.findByText('Sensitive preview');

    state.account.id = '';
    state.account.data = null;
    view.rerender(<MessageThreads onThreadSelect={vi.fn()} />);

    expect(screen.queryByText('Sensitive preview')).not.toBeInTheDocument();
    expect(screen.queryByText('Prior Recipient')).not.toBeInTheDocument();
    await waitFor(() => expect(state.clearMessages).toHaveBeenCalledTimes(2));
  });
});
