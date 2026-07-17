import { vi } from 'vitest';
import { navigateLegacyDocument, reloadDocument } from './navigation';

const primaryClick = () => ({
  altKey: false,
  button: 0,
  ctrlKey: false,
  defaultPrevented: false,
  metaKey: false,
  preventDefault: vi.fn(),
  shiftKey: false
});

describe('navigateLegacyDocument', () => {
  it('prevents Next client navigation and assigns the exact internal href', () => {
    const click = primaryClick();
    const locationLike = { assign: vi.fn() };

    navigateLegacyDocument(locationLike, '/login', click);

    expect(click.preventDefault).toHaveBeenCalledOnce();
    expect(locationLike.assign).toHaveBeenCalledOnce();
    expect(locationLike.assign).toHaveBeenCalledWith('/login');
  });

  it('does nothing for prevented, non-primary, or modified clicks', () => {
    const locationLike = { assign: vi.fn() };

    for (const override of [
      { defaultPrevented: true },
      { button: 1 },
      { altKey: true },
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: true }
    ]) {
      const click = { ...primaryClick(), ...override };

      navigateLegacyDocument(locationLike, '/login', click);
      expect(click.preventDefault).not.toHaveBeenCalled();
    }

    expect(locationLike.assign).not.toHaveBeenCalled();
  });
});

describe('reloadDocument', () => {
  it('delegates exactly once to the supplied location-like boundary', () => {
    const locationLike = { reload: vi.fn() };

    reloadDocument(locationLike);

    expect(locationLike.reload).toHaveBeenCalledOnce();
    expect(locationLike.reload).toHaveBeenCalledWith();
  });
});
