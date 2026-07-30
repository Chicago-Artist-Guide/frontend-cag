import { vi } from 'vitest';
import { reloadDocument } from './navigation';

describe('reloadDocument', () => {
  it('delegates exactly once to the supplied location-like boundary', () => {
    const locationLike = { reload: vi.fn() };

    reloadDocument(locationLike);

    expect(locationLike.reload).toHaveBeenCalledOnce();
    expect(locationLike.reload).toHaveBeenCalledWith();
  });
});
