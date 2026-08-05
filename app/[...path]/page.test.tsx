import fs from 'fs';
import path from 'path';
import React from 'react';
import { vi } from 'vitest';

vi.mock('../legacy-app', () => ({
  default: () => <div>legacy app</div>
}));

import LegacyPage from './page';
import { LEGACY_FIRST_SEGMENTS } from './legacy-first-segments';

const renderCatchAll = (segments?: string[]) =>
  LegacyPage({
    params: Promise.resolve(segments ? { path: segments } : {})
  });

describe('legacy catch-all remount key', () => {
  it('awaits Promise params and keys the legacy app by exact pathname', async () => {
    const home = await renderCatchAll(['home']);
    const messages = await renderCatchAll([
      'profile',
      'messages',
      'thread-1'
    ]);

    expect(home.key).toBe('/home');
    expect(messages.key).toBe('/profile/messages/thread-1');
    expect(home.key).not.toBe(messages.key);
  });

  it('preserves decoded segment boundaries and reserved characters', async () => {
    const embeddedSlash = await renderCatchAll(['profile', 'a/b']);
    const separateSegments = await renderCatchAll(['profile', 'a', 'b']);
    const reservedCharacters = await renderCatchAll(['profile', 'a b?#%']);

    expect(embeddedSlash.key).toBe('/profile/a%2Fb');
    expect(separateSegments.key).toBe('/profile/a/b');
    expect(reservedCharacters.key).toBe('/profile/a%20b%3F%23%25');
    expect(embeddedSlash.key).not.toBe(separateSegments.key);
  });
});

describe('legacy catch-all not-found boundary', () => {
  it('keeps the allowlist in sync with the legacy router table', () => {
    const legacyRouterSource = fs.readFileSync(
      path.join(process.cwd(), 'src', 'routes', 'app-routes.tsx'),
      'utf8'
    );
    const segments = new Set<string>();
    for (const match of legacyRouterSource.matchAll(/path: '(\/[^']*)'/gu)) {
      const [firstSegment] = match[1].slice(1).split('/');
      if (firstSegment) {
        segments.add(firstSegment);
      }
    }

    expect(new Set(LEGACY_FIRST_SEGMENTS)).toEqual(segments);
  });

  it('returns a real 404 for paths no router serves', async () => {
    await expect(renderCatchAll(['__cag_missing_route__'])).rejects.toThrow();
    await expect(renderCatchAll(['x', 'a', 'b'])).rejects.toThrow();
    await expect(renderCatchAll()).rejects.toThrow();
  });
});
