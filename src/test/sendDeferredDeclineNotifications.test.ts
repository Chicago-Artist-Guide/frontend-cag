import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../components/Matches/api', () => ({
  getDeclinedMatchesForProduction: vi.fn(),
  markMatchDeclineNotified: vi.fn()
}));
vi.mock('../components/Messages/api', () => ({
  createMessageThread: vi.fn(),
  sendMessageThreadWithEmail: vi.fn()
}));
vi.mock('../services/accounts/client', () => ({
  getAccountByIdOrUid: vi.fn()
}));

import { sendDeferredDeclineNotifications } from '../components/Matches/declineNotifications';
import {
  getDeclinedMatchesForProduction,
  markMatchDeclineNotified
} from '../components/Matches/api';
import {
  createMessageThread,
  sendMessageThreadWithEmail
} from '../components/Messages/api';
import { getAccountByIdOrUid } from '../services/accounts/client';
import {
  theaterDeclineArtistMessage,
  theaterDeclineArtistEmailText,
  theaterDeclineArtistEmailHtml
} from '../components/Messages/messages';

describe('sendDeferredDeclineNotifications', () => {
  const store = {} as any;
  const production = {
    production_id: 'p1',
    production_name: 'Show',
    roles: [{ role_id: 'r1', role_name: 'Lead' }]
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends email + short message + marks notified for each declined match with email', async () => {
    vi.mocked(getDeclinedMatchesForProduction).mockResolvedValue([
      { id: 'm1', role_id: 'r1', talent_account_id: 'a1' },
      { id: 'm2', role_id: 'r1', talent_account_id: 'a2' }
    ] as any);
    vi.mocked(getAccountByIdOrUid).mockResolvedValue({
      data: { email: 'x@y.com' },
      id: 'a1'
    } as any);
    vi.mocked(sendMessageThreadWithEmail).mockResolvedValue('thread-1');

    const n = await sendDeferredDeclineNotifications(
      store,
      production,
      'theater1',
      'My Theater'
    );

    expect(n).toBe(2);
    expect(sendMessageThreadWithEmail).toHaveBeenCalledTimes(2);
    expect(markMatchDeclineNotified).toHaveBeenCalledTimes(2);
  });

  it('stores only the short in-app message when talent has no email', async () => {
    vi.mocked(getDeclinedMatchesForProduction).mockResolvedValue([
      { id: 'm1', role_id: 'r1', talent_account_id: 'a1' }
    ] as any);
    vi.mocked(getAccountByIdOrUid).mockResolvedValue({
      data: {},
      id: 'a1'
    } as any);
    vi.mocked(createMessageThread).mockResolvedValue('thread-1');

    const n = await sendDeferredDeclineNotifications(
      store,
      production,
      'theater1',
      'My Theater'
    );

    expect(n).toBe(1);
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
    expect(markMatchDeclineNotified).toHaveBeenCalledTimes(1);
  });

  it('uses the short message and full email body for decline notifications', async () => {
    vi.mocked(getDeclinedMatchesForProduction).mockResolvedValue([
      { id: 'm1', role_id: 'r1', talent_account_id: 'a1' }
    ] as any);
    vi.mocked(getAccountByIdOrUid).mockResolvedValue({
      data: { email: 'x@y.com' },
      id: 'a1'
    } as any);
    vi.mocked(sendMessageThreadWithEmail).mockResolvedValue('thread-1');

    await sendDeferredDeclineNotifications(
      store,
      production,
      'theater1',
      'My Theater'
    );

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
  });
});
