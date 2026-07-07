import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../components/Matches/api', () => ({
  getDeclinedAppliedMatchesForRole: vi.fn(),
  getDeclinedMatchesForProduction: vi.fn(),
  markMatchDeclineNotified: vi.fn()
}));
vi.mock('../components/Messages/api', () => ({
  createMessageThread: vi.fn(),
  sendMessageThreadWithEmail: vi.fn()
}));
vi.mock('../components/Profile/shared/api', () => ({
  getAccountWithAccountId: vi.fn()
}));

import { sendRoleCloseDeclineNotifications } from '../components/Matches/declineNotifications';
import {
  getDeclinedAppliedMatchesForRole,
  markMatchDeclineNotified
} from '../components/Matches/api';
import {
  createMessageThread,
  sendMessageThreadWithEmail
} from '../components/Messages/api';
import { getAccountWithAccountId } from '../components/Profile/shared/api';
import {
  theaterDeclineArtistMessage,
  theaterDeclineArtistEmailText,
  theaterDeclineArtistEmailHtml
} from '../components/Messages/messages';

describe('sendRoleCloseDeclineNotifications', () => {
  const store = {} as any;
  const production = {
    production_id: 'p1',
    production_name: 'Show',
    roles: [{ role_id: 'r1', role_name: 'Lead' }]
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends a short in-app message and a separate email copy for declined applicants', async () => {
    vi.mocked(getDeclinedAppliedMatchesForRole).mockResolvedValue([
      { id: 'm1', role_id: 'r1', talent_account_id: 'a1' }
    ] as any);
    vi.mocked(getAccountWithAccountId).mockResolvedValue({
      email: 'x@y.com'
    } as any);
    vi.mocked(sendMessageThreadWithEmail).mockResolvedValue('thread-1');

    const n = await sendRoleCloseDeclineNotifications(
      store,
      production,
      'r1',
      'theater1',
      'My Theater'
    );

    expect(n).toBe(1);
    expect(sendMessageThreadWithEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        shortMessage: theaterDeclineArtistMessage('Lead', 'My Theater'),
        email: expect.objectContaining({
          to: 'x@y.com',
          text: theaterDeclineArtistEmailText('My Theater', 'Lead'),
          html: theaterDeclineArtistEmailHtml('My Theater', 'Lead')
        })
      })
    );
    expect(createMessageThread).not.toHaveBeenCalled();
    expect(markMatchDeclineNotified).toHaveBeenCalledWith(store, 'm1');
  });

  it('stores only the short in-app message when talent has no email', async () => {
    vi.mocked(getDeclinedAppliedMatchesForRole).mockResolvedValue([
      { id: 'm1', role_id: 'r1', talent_account_id: 'a1' }
    ] as any);
    vi.mocked(getAccountWithAccountId).mockResolvedValue({} as any);
    vi.mocked(createMessageThread).mockResolvedValue('thread-1');

    await sendRoleCloseDeclineNotifications(
      store,
      production,
      'r1',
      'theater1',
      'My Theater'
    );

    expect(createMessageThread).toHaveBeenCalledWith(
      store,
      'theater1',
      'a1',
      theaterDeclineArtistMessage('Lead', 'My Theater'),
      'theater',
      'p1',
      'r1'
    );
    expect(sendMessageThreadWithEmail).not.toHaveBeenCalled();
  });
});
