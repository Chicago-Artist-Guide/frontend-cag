import { afterEach, describe, expect, it, vi } from 'vitest';

// The canary serves over plain HTTP, where the page is an insecure
// browsing context and crypto.randomUUID/crypto.subtle do not exist.
// The bios module must evaluate there, and its ids must be stable
// between server render and hydration.
describe('bios', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('evaluates without secure-context crypto APIs', async () => {
    vi.resetModules();
    vi.stubGlobal('crypto', {});

    const { default: bios } = await import('../components/WhoWeAre/bios');

    expect(bios.board.length).toBeGreaterThan(0);
  });

  it('assigns unique ids that are identical on every evaluation', async () => {
    vi.resetModules();
    const first = (await import('../components/WhoWeAre/bios')).default;
    vi.resetModules();
    const second = (await import('../components/WhoWeAre/bios')).default;

    const firstIds = Object.values(first).flat().map((entry) => entry.id);
    const secondIds = Object.values(second).flat().map((entry) => entry.id);

    expect(new Set(firstIds).size).toBe(firstIds.length);
    expect(firstIds).toEqual(secondIds);
  });
});
