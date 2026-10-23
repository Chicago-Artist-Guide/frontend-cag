import { vi } from 'vitest';
import { uuidv4 } from './uuid';

describe('uuidv4', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns distinct RFC 4122 version 4 ids', () => {
    const ids = new Set(Array.from({ length: 100 }, uuidv4));

    expect(ids.size).toBe(100);
    for (const id of ids) {
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
    }
  });

  it('works without the secure-context randomUUID', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: crypto.getRandomValues.bind(crypto)
    });

    expect(uuidv4()).toMatch(/^[0-9a-f-]{36}$/);
  });
});
