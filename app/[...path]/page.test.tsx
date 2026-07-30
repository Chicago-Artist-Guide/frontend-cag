import React from 'react';
import { vi } from 'vitest';

vi.mock('../legacy-app', () => ({
  default: () => <div>legacy app</div>
}));

import LegacyPage from './page';

describe('legacy catch-all remount key', () => {
  it('awaits Promise params and keys the legacy app by exact pathname', async () => {
    const home = await LegacyPage({
      params: Promise.resolve({ path: ['home'] })
    });
    const messages = await LegacyPage({
      params: Promise.resolve({ path: ['profile', 'messages', 'thread-1'] })
    });
    const root = await LegacyPage({ params: Promise.resolve({}) });

    expect(home.key).toBe('/home');
    expect(messages.key).toBe('/profile/messages/thread-1');
    expect(root.key).toBe('/');
    expect(new Set([home.key, messages.key, root.key]).size).toBe(3);
  });

  it('preserves decoded segment boundaries and reserved characters', async () => {
    const embeddedSlash = await LegacyPage({
      params: Promise.resolve({ path: ['x', 'a/b'] })
    });
    const separateSegments = await LegacyPage({
      params: Promise.resolve({ path: ['x', 'a', 'b'] })
    });
    const reservedCharacters = await LegacyPage({
      params: Promise.resolve({ path: ['x', 'a b?#%'] })
    });

    expect(embeddedSlash.key).toBe('/x/a%2Fb');
    expect(separateSegments.key).toBe('/x/a/b');
    expect(reservedCharacters.key).toBe('/x/a%20b%3F%23%25');
    expect(embeddedSlash.key).not.toBe(separateSegments.key);
  });
});
