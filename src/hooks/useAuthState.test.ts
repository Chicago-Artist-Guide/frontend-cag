import { act, renderHook } from '@testing-library/react';
import useAuthState from './useAuthState';

const authMocks = vi.hoisted(() => ({
  onAuthStateChanged: vi.fn(),
  unsubscribe: vi.fn()
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: authMocks.onAuthStateChanged
}));

describe('useAuthState', () => {
  beforeEach(() => {
    authMocks.onAuthStateChanged.mockReset();
    authMocks.unsubscribe.mockReset();
  });

  it('waits for nullable auth, then subscribes and cleans up when it disappears', () => {
    let onChange: ((user: unknown) => void) | undefined;
    authMocks.onAuthStateChanged.mockImplementation((_auth, callback) => {
      onChange = callback;
      return authMocks.unsubscribe;
    });
    const auth = { type: 'auth' } as never;
    const user = { uid: 'auth-user' };
    const { rerender, result } = renderHook(
      ({ currentAuth }) => useAuthState(currentAuth),
      { initialProps: { currentAuth: null as typeof auth | null } }
    );

    expect(result.current.currentUser).toBeNull();
    expect(authMocks.onAuthStateChanged).not.toHaveBeenCalled();

    rerender({ currentAuth: auth });
    expect(authMocks.onAuthStateChanged).toHaveBeenCalledOnce();
    expect(authMocks.onAuthStateChanged).toHaveBeenCalledWith(
      auth,
      expect.any(Function)
    );

    act(() => onChange?.(user));
    expect(result.current.currentUser).toBe(user);

    rerender({ currentAuth: null });
    expect(authMocks.unsubscribe).toHaveBeenCalledOnce();
    expect(authMocks.onAuthStateChanged).toHaveBeenCalledOnce();
    expect(result.current.currentUser).toBeNull();

    act(() => onChange?.({ uid: 'stale-user' }));
    expect(result.current.currentUser).toBeNull();
  });
});
