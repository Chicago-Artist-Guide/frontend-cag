import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../components/Matches/api', () => ({
  getDeclinedMatchesForProduction: vi.fn(),
  getDeclinedAppliedMatchesForRole: vi.fn(),
  markMatchDeclineNotified: vi.fn()
}));
vi.mock('../components/Messages/api', () => ({
  createEmail: vi.fn(),
  createMessageThread: vi.fn()
}));
vi.mock('../components/Profile/shared/api', () => ({
  getAccountWithAccountId: vi.fn()
}));

import { sendDeferredDeclineNotifications } from '../components/Matches/declineNotifications';
import {
  getDeclinedMatchesForProduction,
  markMatchDeclineNotified
} from '../components/Matches/api';
import { createEmail, createMessageThread } from '../components/Messages/api';
import { getAccountWithAccountId } from '../components/Profile/shared/api';
import {
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

  it('sends email + message + marks notified for each declined match with email', async () => {
    vi.mocked(getDeclinedMatchesForProduction).mockResolvedValue([
      { id: 'm1', role_id: 'r1', talent_account_id: 'a1' },
      { id: 'm2', role_id: 'r1', talent_account_id: 'a2' }
    ] as any);
    vi.mocked(getAccountWithAccountId).mockResolvedValue({
      email: 'x@y.com'
    } as any);

    const n = await sendDeferredDeclineNotifications(
      store,
      production,
      'theater1',
      'My Theater'
    );

    expect(n).toBe(2);
    expect(createEmail).toHaveBeenCalledTimes(2);
    expect(createMessageThread).toHaveBeenCalledTimes(2);
    expect(markMatchDeclineNotified).toHaveBeenCalledTimes(2);
  });

  it('skips email when talent has no email but still messages + marks', async () => {
    vi.mocked(getDeclinedMatchesForProduction).mockResolvedValue([
      { id: 'm1', role_id: 'r1', talent_account_id: 'a1' }
    ] as any);
    vi.mocked(getAccountWithAccountId).mockResolvedValue({} as any);

    const n = await sendDeferredDeclineNotifications(
      store,
      production,
      'theater1',
      'My Theater'
    );

    expect(n).toBe(1);
    expect(createEmail).not.toHaveBeenCalled();
    expect(createMessageThread).toHaveBeenCalledTimes(1);
    expect(markMatchDeclineNotified).toHaveBeenCalledTimes(1);
  });

  it('email contains decline role, production, and theatre details', async () => {
    vi.mocked(getDeclinedMatchesForProduction).mockResolvedValue([
      { id: 'm1', role_id: 'r1', talent_account_id: 'a1' }
    ] as any);
    vi.mocked(getAccountWithAccountId).mockResolvedValue({
      email: 'x@y.com'
    } as any);

    await sendDeferredDeclineNotifications(
      store,
      production,
      'theater1',
      'My Theater'
    );

    expect(createEmail).toHaveBeenCalledWith(
      store,
      'x@y.com',
      expect.stringContaining('Lead'),
      theaterDeclineArtistEmailText('My Theater', 'Lead'),
      theaterDeclineArtistEmailHtml('My Theater', 'Lead')
    );
  });
});
