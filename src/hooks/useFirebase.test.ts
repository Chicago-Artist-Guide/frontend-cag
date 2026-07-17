import { act, renderHook } from '@testing-library/react';
import useFirebase from './useFirebase';

const clientMocks = vi.hoisted(() => ({
  analytics: { type: 'analytics' },
  client: {
    app: { name: '[DEFAULT]' },
    auth: { type: 'auth' },
    firestore: { type: 'firestore' },
    storage: { type: 'storage' }
  },
  getFirebaseAnalytics: vi.fn(),
  getFirebaseClient: vi.fn()
}));

vi.mock('../lib/firebase/client', () => ({
  getFirebaseAnalytics: clientMocks.getFirebaseAnalytics,
  getFirebaseClient: clientMocks.getFirebaseClient
}));

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
}

const deferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
};

describe('useFirebase', () => {
  beforeEach(() => {
    clientMocks.getFirebaseAnalytics.mockReset();
    clientMocks.getFirebaseClient.mockReset();
    clientMocks.getFirebaseClient.mockReturnValue(clientMocks.client);
  });

  it('adapts the synchronous client and asynchronously supplies Analytics', async () => {
    const pendingAnalytics = deferred<typeof clientMocks.analytics>();
    clientMocks.getFirebaseAnalytics.mockReturnValue(pendingAnalytics.promise);

    const { result } = renderHook(() => useFirebase());

    expect(result.current).toEqual({
      ...clientMocks.client,
      analytics: null
    });

    await act(async () => {
      pendingAnalytics.resolve(clientMocks.analytics);
      await pendingAnalytics.promise;
    });

    expect(result.current).toEqual({
      ...clientMocks.client,
      analytics: clientMocks.analytics
    });
    expect(clientMocks.getFirebaseClient).toHaveBeenCalledOnce();
    expect(clientMocks.getFirebaseAnalytics).toHaveBeenCalledOnce();
  });

  it('keeps the client stable across rerenders', () => {
    const pendingAnalytics = deferred<typeof clientMocks.analytics>();
    clientMocks.getFirebaseAnalytics.mockReturnValue(pendingAnalytics.promise);

    const { rerender, result } = renderHook(() => useFirebase());
    const first = result.current;
    rerender();

    expect(result.current).toBe(first);
    expect(clientMocks.getFirebaseClient).toHaveBeenCalledOnce();
    expect(clientMocks.getFirebaseAnalytics).toHaveBeenCalledOnce();
  });

  it('does not update Analytics after unmount', async () => {
    const pendingAnalytics = deferred<typeof clientMocks.analytics>();
    clientMocks.getFirebaseAnalytics.mockReturnValue(pendingAnalytics.promise);

    const { result, unmount } = renderHook(() => useFirebase());
    expect(result.current.analytics).toBeNull();
    unmount();

    await act(async () => {
      pendingAnalytics.resolve(clientMocks.analytics);
      await pendingAnalytics.promise;
    });

    expect(result.current.analytics).toBeNull();
  });
});
