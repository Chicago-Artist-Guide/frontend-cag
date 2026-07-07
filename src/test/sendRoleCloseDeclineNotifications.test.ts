import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../components/Matches/api', () => ({
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

import { sendRoleCloseDeclineNotifications } from '../components/Matches/declineNotifications';
import {
  getDeclinedAppliedMatchesForRole,
  markMatchDeclineNotified
} from '../components/Matches/api';
import { createEmail, createMessageThread } from '../components/Messages/api';
import { getAccountWithAccountId } from '../components/Profile/shared/api';
import {
  theaterDeclineArtistEmailText,
  theaterDeclineArtistEmailHtml,
  theaterDeclineArtistMessage
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

  it('notifies only declined-applied matches for the given role', async () => {
    vi.mocked(getDeclinedAppliedMatchesForRole).mockResolvedValue([
      { id: 'm1', role_id: 'r1', talent_account_id: 'a1' }
    ] as any);
    vi.mocked(getAccountWithAccountId).mockResolvedValue({
      email: 'x@y.com'
    } as any);

    const n = await sendRoleCloseDeclineNotifications(
      store,
      production,
      'r1',
      'theater1',
      'My Theater'
    );

    expect(getDeclinedAppliedMatchesForRole).toHaveBeenCalledWith(
      store,
      'p1',
      'r1'
    );
    expect(n).toBe(1);
    expect(createEmail).toHaveBeenCalledWith(
      store,
      'x@y.com',
      expect.stringContaining('Lead'),
      theaterDeclineArtistEmailText('My Theater', 'Lead'),
      theaterDeclineArtistEmailHtml('My Theater', 'Lead')
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
    expect(markMatchDeclineNotified).toHaveBeenCalledWith(store, 'm1');
  });
});
